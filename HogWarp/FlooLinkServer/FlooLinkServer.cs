using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using Buffer = HogWarp.Lib.System.Buffer;
using WebSocketSharp;
using WebSocketSharp.Server;


namespace FlooLink
{
    public class Echo : WebSocketBehavior
    {
        protected override void OnOpen () {
            FlooLinkPlugin._server!.Information($"Connection Opened");
        }
        protected override void OnClose (CloseEventArgs e) {
            FlooLinkPlugin._server!.Information($"Connection Closed");
        }

        protected override void OnMessage (MessageEventArgs e)
        {
            Send (e.Data);
            FlooLinkPlugin._server!.Information($"[MSG] {e.Data}");
        }
    }

    public class FlooLinkPlugin : IPluginBase
    {
        public string Name => "FlooLink";

        public string Description => "Proximity Chat";

        public static Server? _server;

        private WebSocketServer? wsServer;

        public void Initialize(Server server)
        {
            _server = server;
            _server.UpdateEvent += Update;
            _server.ChatEvent += Chat;
            _server.PlayerJoinEvent += PlayerJoin;
            _server.RegisterMessageHandler(Name, HandleMessage);

            wsServer = new WebSocketServer(8081);
            wsServer.AddWebSocketService<Echo> ("/echo");
            // io = new SocketIOServer(new SocketIOServerOption(8081));

            // io.OnConnection((socket) =>
            // {
            //     _server!.Information($"Client Connected");

            //     // socket.On("input", (Data) =>
            //     // {
            //     //     foreach (JToken Token in Data)
            //     //     {
            //     //     Console.Write(Token + " ");
            //     //     }

            //     //     Console.WriteLine();
            //     //     socket.Emit("echo", Data);
            //     // });

            //     socket.On(SocketIOEvent.DISCONNECT, () =>
            //     {
            //         _server!.Information("Client disconnected");
            //     });
            // });
            // Task.Run(() => io.Start());
            wsServer.Start();
            _server!.Information("FlooLink Initialized");
        }

        public void Update(float deltaSeconds)
        {
        }

        public void Chat(Player player, string message, ref bool cancel)
        {
            _server!.Information($"Chat: {message}");
        }

        public void PlayerJoin(Player player)
        {
            _server!.Information("Player joined!");
            SendPing(player, 0);
        }

        public void HandleMessage(Player player, ushort opcode, Buffer buffer)
        {
            var reader = new BufferReader(buffer);

            if(opcode == 43)
            {
                reader.ReadBits(out var ping, 64);

                _server!.Information($"Ping: {ping}");

                SendPing(player, ping);
            }
        }

        private void SendPing(Player player, ulong id)
        {
            var buffer = new Buffer(1000);
            var writer = new BufferWriter(buffer);
            writer.Write(id);

            _server!.PlayerManager.SendTo(player, Name, 43, writer);
        }
    }
}