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
    // TODO => Doesn't need to handle positions anymore
    public class VoiceChatServer : CommandServerBase
    {
        public static Map<string, string> UsernameToSessionID = new Map<string, string>();
        // public static Map<byte, string> ShortIDtoUsername = new Map<byte, string>();
        // public static List<byte> freeIds = Enumerable.Range(0,255).Select(i => (byte)i).ToList();

        private string username;
        private ushort shortId;
        protected override void OnOpen () {
            base.OnOpen();
            username = QueryString["playerId"];

            server.Information($"[VoiceChatServer] Open to user : {username}");


            if (username == null) {
                Sessions.CloseSession(ID, CloseStatusCode.Normal, "No username provided");
                return;
            }
            #if !DEBUG
            if(!manager.playersRequestedJoin.Contains(username)) {
                Sessions.CloseSession(ID, CloseStatusCode.Normal, "Not Requested Join");
                return;
            }
            #endif
            if(!PlayerIDManager.IDToUsername.ContainsReverse(username)) {
                Sessions.CloseSession(ID, CloseStatusCode.Normal, "User not in game");
                return;
            }

            shortId = PlayerIDManager.IDToUsername.Reverse[username];
            

            UsernameToSessionID.Add(username, ID);

            manager.playersRequestedJoin.Remove(username);
            manager.playersInVoice.Add(username);

            // SendCommand(
            //     SendMessageType.PlayerList, 
            //     MessageHelper.createPlayerToNameBytes(manager.playersInVoice, ShortIDtoUsername)
            // );
            // BroadcastCommand(
            //     SendMessageType.PlayerJoin,
            //     MessageHelper.stringToBytes(shortId, username)
            // );
            
            // Check if player is on server
            server.Information($"Connection Opened {shortId} {username}");
            // Send(MessageHelper.stringToBytes(SendMessageType.Test, username));
            
        }

        protected override void OnClose (CloseEventArgs e) {
            server.Information($"Connection Closed {shortId} {username}");
            BroadcastCommand(
                SendMessageType.PlayerLeave,
                BitConverter.GetBytes(shortId)
            );
            manager.playersInVoice.Remove(username);
            UsernameToSessionID.RemoveReverse(ID);
        }

        protected override void OnError(WebSocketSharp.ErrorEventArgs e)
        {
            server.Information($"Connection Error {shortId} {username}");
            BroadcastCommand(
                SendMessageType.PlayerLeave,
                BitConverter.GetBytes(shortId)
            );
            manager.playersInVoice.Remove(username);
            UsernameToSessionID.RemoveReverse(ID);
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

        public WebSocket GetSocketByShortID(ushort id) {
            return Sessions[UsernameToSessionID.Forward[PlayerIDManager.IDToUsername.Forward[id]]].WebSocket;
        }
    }
}