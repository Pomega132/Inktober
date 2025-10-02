using Microsoft.AspNetCore.SignalR;

using Newtonsoft.Json;

using static Webtober2025.Client.Models._01.GameHub;

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

        private Player? _Player { get; set; }

        public static List<Game> Games { get; set; } = [];

        public async Task SendMessage(string message)
        {
            if (_Player is null)
                return;

            Game? game = Games.FirstOrDefault(g => g.Players.Contains(_Player));

            if (game is null)
                return;

            await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, _Player.Name, message);
        }

        public async Task Connect(string playerKey)
        {
            Game? game = Games.FirstOrDefault(g => g.Players.Any(p => p.Id == playerKey));
            if (game is null)
            {
                await Clients.Caller.SendAsync(ACTION_CONNECT_RESPOSE, false, "Partie introuvable", null);
                return;
            }
            _Player = game.Players.First(p => p.Id == playerKey);
            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameKey);
            string jsonGame = JsonConvert.SerializeObject(game);

            await Clients.Caller.SendAsync(ACTION_CONNECT_RESPOSE, true, _Player.Name, jsonGame);
        }

        public async Task CreateServer(string playerName, string? password, int maxPlayers = 2)
        {
            _Player = new Player(playerName, Clients.Caller)
            {
                IsMaster = true
            };

            Game game = new Game(password, _Player, maxPlayers);
            Games.Add(game);

            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameKey);

            await Clients.Caller.SendAsync(ACTION_SERVER_JOIN, _Player.Id);
            await Connect(_Player.Id);
        }

        public async Task JoinGame(string playerName, string? gameKey, string? password)
        {
            _Player = new Player(playerName, Clients.Caller);
            Game? game = Games.FirstOrDefault(g => g.GameKey == gameKey);
            if (game == null)
            {
                await Clients.Caller.SendAsync(ACTION_PLAYER_JOINED, false, "Parite introuvable");
                return;
            }
            if (game.IsStarted)
            {
                await Clients.Caller.SendAsync(ACTION_PLAYER_JOINED, false, "Partie déjà commencée");
                return;
            }
            if (game.Password != null && game.Password != password)
            {
                await Clients.Caller.SendAsync(ACTION_PLAYER_JOINED, false, "Mauvais mot de passe");
                return;
            }
            if (game.Players.Count >= game.MaxPlayers)
            {
                await Clients.Caller.SendAsync(ACTION_PLAYER_JOINED, false, "Partie pleine");
                return;
            }
            game.Players.Add(_Player);
            await Clients.Group(game.GameKey).SendAsync(ACTION_PLAYER_JOINED, true, $"{_Player.Name} joined the game");
            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameKey);
        }

        public async Task SetPersonnage(string jsonPersonnage)
        {
            if (_Player is null)
            {
                return;
            }
            _Player.Personnage = JsonConvert.DeserializeObject<Personnage>(jsonPersonnage);
            if (_Player.Personnage is null)
                return;
            _Player.Personnage.Id = RNG.KeyGen(); // Ensure unique ID

            await Clients.Group(Games.First(g => g.Players.Contains(_Player)).GameKey)
                .SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(Games.First(g => g.Players.Contains(_Player)).Players));
        }

        public async Task StartGame()
        {
            if (_Player is null)
            {
                return;
            }
            Game? game = Games.FirstOrDefault(g => g.Players.Contains(_Player) && g.Creator == _Player);
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

            game.PlayerIdTour = game.Players[RNG.Next(game.Players.Count)].Id;
            await Clients.Group(game.GameKey).SendAsync(ACTION_PLAYER_TOUR, game.PlayerIdTour);
        }

        public async Task Play(string personnageId)
        {
            if (_Player is null)
            {
                return;
            }
            Game? game = Games.FirstOrDefault(g => g.Players.Contains(_Player) && g.PlayerIdTour == _Player.Id);
            if (game is null)
            {
                return;
            }

            if (game.PlayerIdTour != _Player.Id)
            {
                await Clients.Caller.SendAsync(ACTION_RECEIVE_MESSAGE, "Système", "Ce n'est pas à vous de jouer");
                return;
            }

            Player? persoJoueur = (from player in game.Players
                                   where !player.Personnage?.IsDead ?? false
                                   where player.Personnage?.Id == personnageId
                                   select player).FirstOrDefault();

            if (persoJoueur is not null)
            {
                persoJoueur.Personnage!.IsDead = true;
                if (persoJoueur.Id == _Player.Id)
                {
                    await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{_Player.Name} s'est éliminé lui-même !");
                    _Player.Score--;
                }
                else
                {
                    await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{_Player.Name} à trouvé le personnage de {persoJoueur.Name} !");
                    _Player.Score++;
                }
                await Clients.Group(game.GameKey).SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(game.Players));
                await Clients.Group(game.GameKey).SendAsync(UPDATE_PERSONNAGES_LIST, JsonConvert.SerializeObject(game.Grille));
                if (await CheckWin(game, _Player.Id))
                    return;
            }

            Personnage? personnage = game.Grille.SelectMany(l => l).FirstOrDefault(p => p.Id == personnageId);
            if (personnage is null || personnage.IsDead)
                return;

            personnage.IsDead = true;

            await Clients.Caller.SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{_Player.Name} n'a pas trouvé le bon personnage.");
            await Clients.Group(game.GameKey).SendAsync(UPDATE_PERSONNAGES_LIST, JsonConvert.SerializeObject(game.Grille));
            string nextPlayerTour = game.NextPlayerIdTour();

            if(await CheckWin(game, nextPlayerTour))
                return;

            await Clients.Group(game.GameKey).SendAsync(ACTION_PLAYER_TOUR, nextPlayerTour);
        }

        private async Task<bool> CheckWin(Game game, string playerId)
        {
            if (game.Players.Count(p => p.Id != playerId && (!p.Personnage?.IsDead ?? false)) == 0)
            {
                // Game over
                Player? winner = game.Players.OrderByDescending(p => p.Score).FirstOrDefault();
                if (winner is not null)
                    await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"{winner.Name} a gagné la partie avec {winner.Score} points !");
                else
                    await Clients.Group(game.GameKey).SendAsync(ACTION_RECEIVE_MESSAGE, "Système", $"Personne n'a gagné la partie !");

                await Clients.Group(game.GameKey).SendAsync(ACTION_GAME_OVER);
                game.PlayerIdTour = null;
                game.IsStarted = false;

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
            [JsonIgnore]
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
                foreach (var player in Players)
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

        public class Player(string name, IClientProxy client)
        {
            public string Id { get; set; } = RNG.KeyGen();
            public int Score { get; set; } = 0;
            public string Name { get; set; } = name;
            [JsonIgnore]
            public IClientProxy Client { get; set; } = client;
            public bool IsMaster { get; set; } = false;
            public bool IsReady { get => Personnage is not null; }
            [JsonIgnore]
            public Personnage? Personnage { get; set; }
        }

    }
}
