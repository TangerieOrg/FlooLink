using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using Buffer = HogWarp.Lib.System.Buffer;
using WebSocketSharp;
using WebSocketSharp.Server;
using WebSocketSharp.Net;
using System.Text;

namespace FlooLink
{
    public abstract class CommandServerBase : WebSocketBehavior {
        protected Manager manager;
        protected Server server;
        
        
        protected override void OnOpen()
        {
            manager = Manager.instance!;
            server = manager.server;
        }

        protected void SendCommand(SendMessageType cmd, byte[] data) {
            Send(MessageHelper.withCommand(cmd, data));
        }

        protected void BroadcastCommand(SendMessageType cmd, byte[] data) {
            Sessions.Broadcast(MessageHelper.withCommand(cmd, data));
        }
    }
}