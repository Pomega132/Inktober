using System.Text;

using Microsoft.AspNetCore.SignalR;

using Newtonsoft.Json;

using Tools.Core;

namespace Webtober2025.Client.Models._01
{
    public class GameHub : Hub
    {
        public const string ACTION_SERVER_JOIN = "ServerJoin";
        public const string ACTION_RECEIVE_MESSAGE = "ReceiveMessage";
        public const string ACTION_PLAYER_JOINED = "PlayerJoined";
        public const string ACTION_GAME_STARTED = "GameStarted";
        public const string ACTION_CONNECT_RESPOSE = "ConnectResponse";
        public const string ACTION_PLAYER_TOUR = "PlayerTour";
        public const string ACTION_GAME_OVER = "GameOver";
        public const string UPDATE_PLAYER_LIST = "UpdatePlayerList";
        public const string UPDATE_PERSONNAGES_LIST = "UpdatePersonnagesList";
        const int LIGNES = 3;
        const int COLONNES = 5;

        public static Games AllGames { get; set; } = [];

        public async Task SendMessage(string message)
        {
            Player? player = AllGames.GetPlayerByConnectionId(Context.ConnectionId);

            if (player is null)
                return;

            Game? game = AllGames.FirstOrDefault(g => g.Players.Contains(player));

            if (game is null)
                return;

            await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, player.Name, message);
        }

        public async Task Connect(string playerKey)
        {
            Game? game = AllGames.FirstOrDefault(g => g.Players.Any(p => p.Id == playerKey));
            if (game is null)
            {
                await Clients.Caller.SendAsync(ACTION_CONNECT_RESPOSE, false, "Partie introuvable", null);
                return;
            }
            Player player = game.Players.First(p => p.Id == playerKey);
            if (player is not null)
            {
                player.ConnectionId = Context.ConnectionId;

                await Groups.AddToGroupAsync(Context.ConnectionId, game.GameKey);
                string jsonGame = JsonConvert.SerializeObject(game);

                await Clients.Caller.SendAsync(ACTION_CONNECT_RESPOSE, true, player.Name, jsonGame);
            }
        }

        public async Task CreateServer(string playerName, string? password, int maxPlayers = 2)
        {
            Player player = new Player(playerName, Context.ConnectionId, Clients.Caller)
            {
                IsMaster = true
            };

            Game game = new Game(password, player, maxPlayers);
            AllGames.Add(game);

            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameKey);

            await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, true, player.Id);
            await Connect(player.Id);
        }

        public async Task JoinGame(string playerName, string? gameKey, string? password)
        {
            Player player = new Player(playerName, Context.ConnectionId, Clients.Caller);
            Game? game = AllGames.FirstOrDefault(g => g.GameKey == gameKey?.Trim());
            if (game == null)
            {
                await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, false, "Parite introuvable");
                return;
            }
            if (game.IsStarted)
            {
                await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, false, "Partie déjà commencée");
                return;
            }
            if (game.Password != null && game.Password != password)
            {
                await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, false, "Mauvais mot de passe");
                return;
            }
            if (game.Players.Count >= game.MaxPlayers)
            {
                await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, false, "Partie pleine");
                return;
            }
            game.Players.Add(player);
            await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, true, player.Id);
            await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{player.Name} joined the game");
            await Clients.Group(game.GameKey).SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(game.Players));
            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameKey);
            await Connect(player.Id);
        }

        public async Task SetPersonnage(string jsonPersonnage)
        {
            Player? player = AllGames.GetPlayerByConnectionId(Context.ConnectionId);

            if (player is null)
            {
                return;
            }
            player.Personnage = JsonConvert.DeserializeObject<Personnage>(jsonPersonnage);
            if (player.Personnage is null)
                return;
            player.Personnage.Id = RNG.KeyGen(); // Ensure unique ID

            await Clients.Group(AllGames.First(g => g.Players.Contains(player)).GameKey)
                .SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(AllGames.First(g => g.Players.Contains(player)).Players));
        }

        public async Task StartGame()
        {
            Player? player = AllGames.GetPlayerByConnectionId(Context.ConnectionId);

            if (player is null)
            {
                return;
            }
            Game? game = AllGames.FirstOrDefault(g => g.Players.Contains(player) && g.Creator == player);
            if (game is null)
            {
                return;
            }
            if (game.Players.Any(p => !p.IsReady))
            {
                await Clients.Caller.SendAsync(ACTION_RECEIVE_MESSAGE, "Système", "Tous les joueurs doivent être prêts");
                return;
            }
            game.IsStarted = true;

            game.Players.ForEach(p => p.Score = 0);

            game.GenGrille();
            string jsonPersonnes = JsonConvert.SerializeObject(game.Grille);

            await Clients.Group(game.GameKey).SendAsync(UPDATE_PERSONNAGES_LIST, jsonPersonnes);
            await Clients.Group(game.GameKey).SendAsync(ACTION_GAME_STARTED);

            Player joueurQuiCommence = game.Players[RNG.Next(game.Players.Count)];
            game.PlayerIdTour = joueurQuiCommence.Id;
            await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"Début de la partie ! C'est {joueurQuiCommence.Name} qui commence.");
            await Clients.Group(game.GameKey).SendAsync(ACTION_PLAYER_TOUR, game.PlayerIdTour);
        }

        public async Task Play(string personnageId)
        {
            Player? player = AllGames.GetPlayerByConnectionId(Context.ConnectionId);

            if (player is null)
            {
                return;
            }
            Game? game = AllGames.FirstOrDefault(g => g.Players.Contains(player));
            if (game is null)
            {
                return;
            }

            if (game.PlayerIdTour != player.Id)
            {
                await Clients.Caller.SendAsync(ACTION_RECEIVE_MESSAGE, "Système", "Ce n'est pas à vous de jouer");
                return;
            }

            Personnage? personnage = game.Grille.SelectMany(l => l).FirstOrDefault(p => p.Id == personnageId);

            if (personnage is null || personnage.State != Personnage.E_State.ALIVE)
            {
                await Clients.Caller.SendAsync(ACTION_RECEIVE_MESSAGE, "Système", "Ce perssonage à déjà été éliminé");
                return;
            }

            Player? persoJoueur = (from p in game.Players
                                   where p.Personnage?.State == Personnage.E_State.ALIVE
                                   where p.Personnage?.Id == personnageId
                                   select p).FirstOrDefault();

            if (persoJoueur is not null)
            {
                persoJoueur.Personnage!.State = Personnage.E_State.PLAYER_DEAD;
                if (persoJoueur.Id == player.Id)
                {
                    await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{player.Name} s'est éliminé lui-même !");
                    player.Score--;
                }
                else
                {
                    await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{player.Name} à trouvé le personnage de {persoJoueur.Name} !");
                    player.Score++;
                }
                await Clients.Group(game.GameKey).SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(game.Players));
                await Clients.Group(game.GameKey).SendAsync(UPDATE_PERSONNAGES_LIST, JsonConvert.SerializeObject(game.Grille));
                if (await CheckWin(game, player.Id))
                    return;
            }

            personnage = game.Grille.SelectMany(l => l).FirstOrDefault(p => p.Id == personnageId);
            string nextPlayerTour = game.NextPlayerIdTour();
            if (personnage is null || personnage.State != Personnage.E_State.ALIVE)
            {
                if (await CheckWin(game, nextPlayerTour))
                    return;
                await Clients.Group(game.GameKey).SendAsync(ACTION_PLAYER_TOUR, nextPlayerTour);

                return;
            }

            personnage.State = Personnage.E_State.BOT_DEAD;

            await Clients.Caller.SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{player.Name} n'a pas trouvé le bon personnage.");
            await Clients.Group(game.GameKey).SendAsync(UPDATE_PERSONNAGES_LIST, JsonConvert.SerializeObject(game.Grille));

            if (await CheckWin(game, nextPlayerTour))
                return;

            await Clients.Group(game.GameKey).SendAsync(ACTION_PLAYER_TOUR, nextPlayerTour);
        }

        private async Task<bool> CheckWin(Game game, string playerId)
        {
            if (!game.Players.Any(p => p.Id != playerId && (p.Personnage?.State == Personnage.E_State.ALIVE)))
            {
                // Game over
                int higthestScore = game.Players.Max(p => p.Score);

                IEnumerable<Player> winner = game.Players.Where(p => p.Score == higthestScore);

                StringBuilder message = new StringBuilder();
                if (winner.Count() == 1) // S'il n'y a qu'un·e gagnant·e
                    message.Append($"{winner.First().Name} a");
                else // S'il y a plusieurs gagnant·e·s
                    message.Append($"{string.Join(", ", winner.Take(winner.Count() - 1).Select(j => j.Name))} et {winner.Last().Name} ont");

                // Score du/des gagnant·e·s
                message.Append($" gagné la partie avec {higthestScore} point{(Math.Abs(higthestScore) > 1 ? "s" : "")}");
                if (winner.Count() > 1)
                    message.Append(" chacun");

                message.Append(" !");

                // Annoncer le(s) gagnant·e·s
                await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", message.ToString());

                IEnumerable<ScoreEntry> scores = from p in game.Players
                                                 orderby p.Score descending
                                                 select new ScoreEntry(p.Name, p.Score, p.Score == higthestScore);

                string jsonScores = JsonConvert.SerializeObject(scores);

                await Clients.Group(game.GameKey).SendAsync(ACTION_GAME_OVER, jsonScores);
                game.PlayerIdTour = null;
                game.IsStarted = false;
                game.Players.ForEach(p =>
                {
                    p.IsReady = false;
                    p.Personnage = null;
                    p.Score = 0;
                });
                game.Grille.Clear();

                await Clients.Group(game.GameKey).SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(game.Players));

                return true;
            }

            return false;
        }

        public class Game(string? password, Player creator, int maxPlayers)
        {
            public string GameKey { get; set; } = RNG.KeyGen();
            public string? PlayerIdTour { get; set; }
            public string? Password { get; set; } = password;
            public List<Player> Players { get; set; } = [creator];
            public Player Creator { get; set; } = creator;
            public int MaxPlayers { get; set; } = maxPlayers;
            public bool IsStarted { get; set; } = false;
            [JsonIgnore]
            public List<Personnage> Personnages { get; set; } = GenPersonage(maxPlayers);
            public List<List<Personnage>> Grille { get; set; } = [[], []];

            public void GenGrille()
            {
                List<Personnage> allPersonnages = GetAllPersonnages();
                allPersonnages = allPersonnages.OrderBy(x => RNG.Next()).ToList();
                for (int i = 0; i < LIGNES; i++)
                {
                    List<Personnage> ligne = [];
                    for (int j = 0; j < COLONNES; j++)
                    {
                        ligne.Add(allPersonnages[(i * COLONNES) + j]);
                    }
                    Grille.Add(ligne);
                }
            }

            public string NextPlayerIdTour()
            {
                if (PlayerIdTour is null)
                    PlayerIdTour = Players[RNG.Next(Players.Count)].Id;
                else
                {
                    int currentIndex = Players.FindIndex(p => p.Id == PlayerIdTour);
                    int nextIndex = (currentIndex + 1) % Players.Count;
                    PlayerIdTour = Players[nextIndex].Id;
                }

                return PlayerIdTour;
            }

            private List<Personnage> GetAllPersonnages()
            {
                List<Personnage> personnages = [];
                foreach (Player player in Players)
                {
                    if (player.Personnage is not null)
                    {
                        personnages.Add(player.Personnage);
                    }
                }
                personnages.AddRange(Personnages);
                return personnages;
            }

            private static List<Personnage> GenPersonage(int maxPlayers)
            {
                int toGenerate = (LIGNES * COLONNES) - maxPlayers;
                List<Personnage> personnages = [];
                for (int i = 0; i < toGenerate; i++)
                {
                    personnages.Add(Personnage.GenerateRandom());
                }

                return personnages;
            }

        }

        public class Games : List<Game>
        {
            public Player? GetPlayerById(string playerId)
            {
                foreach (Game game in this)
                {
                    Player? player = game.Players.FirstOrDefault(p => p.Id == playerId);
                    if (player is not null)
                        return player;
                }
                return null;
            }

            public Player? GetPlayerByConnectionId(string connectionId)
            {
                foreach (Game game in this)
                {
                    Player? player = game.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
                    if (player is not null)
                        return player;
                }
                return null;
            }
        }

        public class Player(string name, string connectionId, IClientProxy client)
        {
            private bool _IsReady = false;

            public string Id { get; set; } = RNG.KeyGen();
            public string ConnectionId { get; set; } = connectionId;
            public int Score { get; set; } = 0;
            public string Name { get; set; } = name;
            [JsonIgnore]
            public IClientProxy Client { get; set; } = client;
            public bool IsMaster { get; set; } = false;
            public bool IsReady { get => _IsReady || Personnage is not null; set => _IsReady = value; }
            [JsonIgnore]
            public Personnage? Personnage { get; set; }
        }

        public class ScoreEntry(string playerName, int score, bool winner)
        {
            public string PlayerName { get; set; } = playerName;
            public int Score { get; set; } = score;
            public bool Winner { get; set; } = winner;
        }
    }
}
