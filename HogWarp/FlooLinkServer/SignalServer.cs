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
        public static Map<byte, string> ShortIDtoUsername = new Map<byte, string>();
        public static List<byte> freeIds = Enumerable.Range(0,255).Select(i => (byte)i).ToList();

        private string username;
        private byte shortId;
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
            if(freeIds.Count == 0) {
                Sessions.CloseSession(ID, CloseStatusCode.Normal, "Full");
                return;
            }
            shortId = freeIds[0];
            freeIds.RemoveAt(0);

            ShortIDtoUsername.Add(shortId, username);
            UsernameToID.Add(username, ID);

            manager.playersRequestedJoin.Remove(username);
            manager.playersInVoice.Add(username);

            SendCommand(
                SendMessageType.PlayerList, 
                MessageHelper.createPlayerToNameBytes(manager.playersInVoice, ShortIDtoUsername)
            );
            BroadcastCommand(
                SendMessageType.PlayerJoin,
                MessageHelper.stringToBytes(shortId, username)
            );
            
            // Check if player is on server
            server.Information($"Connection Opened {shortId} {username}");
            // Send(MessageHelper.stringToBytes(SendMessageType.Test, username));
            
        }

        protected override void OnClose (CloseEventArgs e) {
            server.Information($"Connection Closed {shortId} {username}");
            BroadcastCommand(
                SendMessageType.PlayerLeave,
                new byte[] { shortId }
            );
            manager.playersInVoice.Remove(username);
            UsernameToID.RemoveReverse(ID);
            ShortIDtoUsername.RemoveForward(shortId);
            freeIds.Add(shortId);
        }

        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            server.Information($"Connection Error {shortId} {username}");
            BroadcastCommand(
                SendMessageType.PlayerLeave,
                new byte[] { shortId }
            );
            manager.playersInVoice.Remove(username);
            UsernameToID.RemoveReverse(ID);
            ShortIDtoUsername.RemoveForward(shortId);
            freeIds.Add(shortId);
        }

        protected override void OnMessage (MessageEventArgs e)
        {
            RecieveMessageType cmd = (RecieveMessageType)e.RawData[0];
            #if DEBUG
            server.Information($"[MSG - {shortId} {username}] {cmd.ToString()} {e.Data}");
            server.Information($"{e.RawData[1].ToString()}");
            #endif
            
            // Handle signalling
        }

        public WebSocket GetSocketByShortID(byte id) {
            return Sessions[UsernameToID.Forward[ShortIDtoUsername.Forward[0]]].WebSocket;
        }

        private void SendCommand(SendMessageType cmd, byte[] data) {
            Send(MessageHelper.withCommand(cmd, data));
        }

        private void BroadcastCommand(SendMessageType cmd, byte[] data) {
            Sessions.Broadcast(MessageHelper.withCommand(cmd, data));
        }
    }
}