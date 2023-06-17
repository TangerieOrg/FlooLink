using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using Buffer = HogWarp.Lib.System.Buffer;
using WebSocketSharp;
using WebSocketSharp.Server;
using WebSocketSharp.Net;
using System.Text;

/*
Discord Usernames:
    - alphanumeric
    - "."
    - "_"
    - Lowercase
    - 2 - 32 chars
*/

namespace FlooLink
{
    public class SignalServer : WebSocketBehavior
    {
        public static Map<string, string> UsernameToID = new Map<string, string>();

        private string username;
        private Manager manager;
        private Server server;
        protected override void OnOpen () {
            manager = Manager.instance!;
            server = manager.server;
            username = QueryString["playerId"];
            if(username == null) {
                Sessions.CloseSession(ID, CloseStatusCode.Normal, "No username provided");
                return;
            }
            #if !DEBUG
            if(!manager.playersRequestedJoin.Contains(username)) {
                Sessions.CloseSession(ID, CloseStatusCode.Normal, "Not Requested Join");
                return;
            }
            #endif
            UsernameToID.Add(username, ID);
            manager.playersRequestedJoin.Remove(username);
            manager.playersInVoice.Add(username);
            SendCommand(
                SendMessageType.PlayerList, 
                MessageHelper.stringEnumerableToBytes(manager.playersInVoice)
            );
            BroadcastCommand(
                SendMessageType.PlayerJoin,
                MessageHelper.stringToBytes(username)
            );
            
            // Check if player is on server
            server.Information($"Connection Opened {ID} {username}");
            // Send(MessageHelper.stringToBytes(SendMessageType.Test, username));
            
        }

        protected override void OnClose (CloseEventArgs e) {
            server.Information($"Connection Closed {ID} {username}");
            BroadcastCommand(
                SendMessageType.PlayerLeave,
                MessageHelper.stringToBytes(username)
            );
            manager.playersInVoice.Remove(username);
            UsernameToID.RemoveReverse(ID);
        }

        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            server.Information($"Connection Error {ID} {username}");
            BroadcastCommand(
                SendMessageType.PlayerLeave,
                MessageHelper.stringToBytes(username)
            );
            manager.playersInVoice.Remove(username);
            UsernameToID.RemoveReverse(ID);
        }

        protected override void OnMessage (MessageEventArgs e)
        {
            // No messages need to be recieved rn
            #if DEBUG
            server.Information($"[MSG - {ID} {username}] {e.Data}");
            #endif
        }

        private void SendCommand(SendMessageType cmd, byte[] data) {
            Send(MessageHelper.withCommand(cmd, data));
        }

        private void BroadcastCommand(SendMessageType cmd, byte[] data) {
            Sessions.Broadcast(MessageHelper.withCommand(cmd, data));
        }
    }
}