using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using Buffer = HogWarp.Lib.System.Buffer;
using SocketIOSharp.Server;
using EngineIOSharp.Common.Enum;
using SocketIOSharp.Client;
using SocketIOSharp.Common;

namespace FlooLink
{
    public class FlooLinkPlugin : IPluginBase
    {
        public string Name => "FlooLink";

        public string Description => "Proximity Chat";

        private Server? _server;

        private SocketIOServer? io;

        public void Initialize(Server server)
        {
            _server = server;
            _server.UpdateEvent += Update;
            _server.ChatEvent += Chat;
            _server.PlayerJoinEvent += PlayerJoin;
            _server.RegisterMessageHandler(Name, HandleMessage);

            io = new SocketIOServer(new SocketIOServerOption(8081));

            io.OnConnection((socket) =>
            {
                _server!.Information($"Client Connected");

                // socket.On("input", (Data) =>
                // {
                //     foreach (JToken Token in Data)
                //     {
                //     Console.Write(Token + " ");
                //     }

                //     Console.WriteLine();
                //     socket.Emit("echo", Data);
                // });

                socket.On(SocketIOEvent.DISCONNECT, () =>
                {
                    _server!.Information("Client disconnected");
                });
            });
            Task.Run(() => io.Start());
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