using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using Buffer = HogWarp.Lib.System.Buffer;
using WebSocketSharp;
using WebSocketSharp.Server;
using WebSocketSharp.Net;


namespace FlooLink
{
    public class FlooLinkPlugin : IPluginBase
    {
        public string Name => "FlooLink";

        public string Description => "Proximity Chat";

        public static Server? _server;

        public static Manager? manager;

        public void Initialize(Server server)
        {
            _server = server;
            manager = new Manager(server);

            manager.Start();
        }

        
        // public void HandleMessage(Player player, ushort opcode, Buffer buffer)
        // {
        //     var reader = new BufferReader(buffer);

        //     if(opcode == 43)
        //     {
        //         reader.ReadBits(out var ping, 64);

        //         _server!.Information($"Ping: {ping}");

        //         SendPing(player, ping);
        //     }
        // }

        // private void SendPing(Player player, ulong id)
        // {
        //     var buffer = new Buffer(1000);
        //     var writer = new BufferWriter(buffer);
        //     writer.Write(id);

        //     _server!.PlayerManager.SendTo(player, Name, 43, writer);
        // }
    }
}