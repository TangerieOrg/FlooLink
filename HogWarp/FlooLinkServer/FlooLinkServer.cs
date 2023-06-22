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

        public static Server _server;

        public static Manager manager;

        public void Initialize(Server server)
        {
            _server = server;
            manager = new Manager(server);

            manager.Start();
        }
    }
}