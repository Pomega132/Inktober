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
        public const string UPDATE_PLAYER_LIST = "UpdatePlayerList";
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        private static Random _RNG = new Random();

        private Player? _Player { get; set; }

        public static List<Game> Games { get; set; } = [];

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync(ACTION_RECEIVE_MESSAGE, user, message);
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

        public async Task SetPersonnage(string jsonPersonnage)
        {
            if (_Player is null)
            {
                return;
            }
            _Player.Personnage = JsonConvert.DeserializeObject<Personnage>(jsonPersonnage);
            await Clients.Group(Games.First(g => g.Players.Contains(_Player)).GameKey)
                .SendAsync(UPDATE_PLAYER_LIST, JsonConvert.SerializeObject(Games.First(g => g.Players.Contains(_Player)).Players));
        }

        private static string KeyGen()
        {
            string key = "";
            for (int i = 0; i < 7; i++)
            {
                key += chars[_RNG.Next(chars.Length)];
            }

            return key;
        }

        public class Game(string? password, Player creator, int maxPlayers)
        {
            public string GameKey { get; set; } = KeyGen();
            public string? Password { get; set; } = password;
            public List<Player> Players { get; set; } = [creator];
            public Player Creator { get; set; } = creator;
            public int MaxPlayers { get; set; } = maxPlayers;
            public bool IsStarted { get; set; } = false;
        }

        public class Player(string name, IClientProxy client)
        {
            public string Id { get; set; } = KeyGen();
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
