using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using Buffer = HogWarp.Lib.System.Buffer;
using WebSocketSharp;
using WebSocketSharp.Server;
using WebSocketSharp.Net;


namespace FlooLink
{

    public class Manager {
        public const double UpdatesPerSecond = 3;
        private const int tickMod = (int)(30 / UpdatesPerSecond);
        public Server server;

        public WebSocketServer ws;
        public WebSocketServiceHost vcServer;
        public WebSocketServiceHost mapServer;

        public static Manager instance;

        // Players in-game and in voice
        public HashSet<string> playersInVoice = new HashSet<string>();
        // Players in-game but not yet in voice (and requested to join)
        public HashSet<string> playersRequestedJoin = new HashSet<string>();
        public Dictionary<string, Player> playerMap = new Dictionary<string, Player>();

        public Manager(Server _server) {
            instance = this;
            server = _server;

            // Add wss
            ws = new WebSocketServer(8081);
            ws.AddWebSocketService<VoiceChatServer>("/vc");
            ws.AddWebSocketService<MapServer>("/map");
            vcServer = ws!.WebSocketServices["/vc"];
            mapServer = ws!.WebSocketServices["/map"];
            MapServer.Self = mapServer;
            RegisterHWEvents();
        }

        private void RegisterHWEvents() {
            server.UpdateEvent += Update;
            server.ChatEvent += Chat;
            server.PlayerJoinEvent += PlayerJoin;
            server.PlayerLeaveEvent += PlayerLeave;
            server.ShutdownEvent += Shutdown;
        }

        public void Start() {
            ws.Start();
            server.Information($"FlooLink Started on {ws.Port}");
            #if DEBUG
            // playersInVoice.Add("testPlayer");
            // PlayerIDManager.RegisterPlayer("testPlayer");
            #endif
        }

        public void Shutdown() {
            ws.Stop();
            server.Information("FlooLink Stopped");
        }

        private int ticks = 0;

        public unsafe void Update(float deltaSeconds)
        {
            if(ticks % tickMod == 0) {
                MapServer.BroadcastPlayerPositions();
            }
            ticks++;
        }

        private void MessageServerPlayer(Player player, params string[] msgs) {
            var str = String.Join(" ", msgs);
            Logger.Information("[FlooLink] " + str);
            player.SendMessage(str);
        }

        public unsafe void Chat(Player player, string message, ref bool cancel)
        {
            if(!message.StartsWith("/")) return;
            List<string> args = message.Split(new char[] {' ','\t'}, StringSplitOptions.RemoveEmptyEntries).ToList();
            if(!(args[0] == "/fl" || args[0] == "/floolink")) return;
            cancel = true;
            if(args.Count == 1) return;
            string command = args[1];
            args.RemoveRange(0, 2);
            
            // From here all messages are "/fl <command> ...<args>" (or "/floolink ...")

            #if DEBUG
            if(command == "pos") {
                // 357676 -448848 -82809
                // 358236 -448568 -82809
                
                var pos = player.Address->LastMovement.Move.Position;
                MessageServerPlayer(player, $"[POS] {pos.X} {pos.Y} {pos.Z}");
            } else if(command == "ls") {
                MessageServerPlayer(player, "Requested:");
                foreach(var username in playersRequestedJoin) {
                    MessageServerPlayer(player, "    " + username);
                }
                MessageServerPlayer(player, "Connected:");
                foreach(var username in playersInVoice) {
                    MessageServerPlayer(player, "    " + username);
                }
                MessageServerPlayer(player, "In Game:");
                foreach(var pair in PlayerIDManager.GetEnumerator()) {
                    MessageServerPlayer(player, $"   [{pair.Item1}] {pair.Item2}");
                }
            }
            #endif
            if(command == "join") {
                playersRequestedJoin.Add(player.Name);
                Logger.Information("Requesting join from", player.Name);
                // Send message to player with link
            }
        }

        public unsafe void PlayerJoin(Player player)
        {
            var id = PlayerIDManager.RegisterPlayer(player);
            Logger.Debug("Player joined", player.Name, id.ToString());
            playerMap.Add(player.Name, player);
            MapServer.BroadcastPlayerJoin(player);
        }

        public unsafe void PlayerLeave(Player player) {
            Logger.Debug("Player left", player.Name);
            MapServer.BroadcastPlayerLeave(player);
            playerMap.Remove(player.Name);
            
            if(playersInVoice.Remove(player.Name)) {
                // Disconnect websocket for player
                DisconnectByUsername(player.Name);
            }

            playersRequestedJoin.Remove(player.Name);
            PlayerIDManager.UnregisterPlayer(player);
        }

        public void DisconnectByUsername(string username) {
            string ID = VoiceChatServer.UsernameToSessionID.Forward[username];
            vcServer.Sessions.CloseSession(ID);
        }
    }
}