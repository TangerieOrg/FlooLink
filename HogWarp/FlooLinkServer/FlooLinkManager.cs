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
        public Server server;

        public WebSocketServer ws;
        public WebSocketServiceHost wsHost;

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
            ws.AddWebSocketService<SignalServer>("/");
            wsHost = ws!.WebSocketServices["/"];
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
            playersInVoice.Add("testPlayer");
            SignalServer.ShortIDtoUsername.Add(0, "testPlayer");
            SignalServer.freeIds.Remove(0);
            #endif
        }

        public void Shutdown() {
            ws.Stop();
            server.Information("FlooLink Stopped");
        }

        private int ticks = 0;

        public unsafe void Update(float deltaSeconds)
        {
            if(ticks % (10) == 0) {
                int length = playersInVoice.Count * 13 + 1;
                byte[] msg = new byte[length]; // 1 + 1 + 3*4
                msg[0] = (byte)SendMessageType.Position;
                int i = 0;
                #if DEBUG
                if(!playerMap.ContainsKey("tangerie")) {
                    return;
                }
                #endif
                foreach(var username in playersInVoice) {
                    msg[1 + i * 13] = SignalServer.ShortIDtoUsername.Reverse[username];
                    #if DEBUG
                    var pos = playerMap["tangerie"].Address->LastMovement.Move.Position;
                    #else
                    var pos = playerMap[username].Address->LastMovement.Move.Position;
                    #endif
                    
                    BitConverter.GetBytes(pos.X).CopyTo(msg, 1 + i * 13 + 1);
                    BitConverter.GetBytes(pos.Y).CopyTo(msg, 1 + i * 13 + 1 + 4);
                    BitConverter.GetBytes(pos.Z).CopyTo(msg, 1 + i * 13 + 1 + 4 * 2);
                    i++;
                }
                
                wsHost.Sessions.Broadcast(msg);
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
            string command = args[1];
            args.RemoveRange(0, 2);
            cancel = true;
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
            Logger.Debug("Player joined", player.Name);
            playerMap.Add(player.Name, player);
        }

        public unsafe void PlayerLeave(Player player) {
            Logger.Debug("Player left", player.Name);
            playerMap.Remove(player.Name);
            
            if(playersInVoice.Remove(player.Name)) {
                // Disconnect websocket for player
                DisconnectByUsername(player.Name);
            }

            playersRequestedJoin.Remove(player.Name);
        }

        public void DisconnectByUsername(string username) {
            string ID = SignalServer.UsernameToID.Forward[username];
            wsHost.Sessions.CloseSession(ID);
        }
    }
}