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
    public class MapServer : CommandServerBase
    {

        public static WebSocketServiceHost Self;

        protected override void OnOpen()
        {
            base.OnOpen();
            sendPlayerList();
        }

        /*
        == Info ==
        <Gender = 1>
        <House = 1>
        <NameLen = 1>
        <Name = NameLen>

        TOTAL = 3 + NameLen
        */
        private static unsafe void addPlayerInfo(ushort id, ref List<byte> msg) {
            addPlayerInfo(PlayerIDManager.GetPlayer(id), ref msg);
        }

        private static unsafe void addPlayerInfo(Player player, ref List<byte> msg) {
            var character = *player.Address; 
            msg.Add((byte)character.Gender);
            msg.Add((byte)character.House);
            var nameBytes = MessageHelper.stringToBytes(player.Name);
            // Safe to be byte as max length = 32
            msg.Add(Convert.ToByte(nameBytes.Length));
            msg.AddRange(nameBytes);
        }

        /*
        == MSG ==
        <Cmd = 1>
        <NumPlayers = 2>
        <Ids = 2 * NumPlayers>
        <Infos = addPlayerInfo>
        */
        private void sendPlayerList() {
            #if !DEBUG
            if(PlayerIDManager.IDToUsername.Count() == 0) {
                // Empty player list
                Send(new byte[] {(byte)SendMessageType.PlayerList, 0, 0});
                return;
            }
            #endif
            List<byte> msg = new List<byte>();
            msg.Add((byte)SendMessageType.PlayerList);
            ushort count = Convert.ToUInt16(PlayerIDManager.IDToUsername.Count());
            #if DEBUG
            count++;
            #endif
            msg.AddRange(BitConverter.GetBytes(count));
            
            List<byte> infoBytes = new List<byte>();
            foreach(var pair in PlayerIDManager.GetEnumerator()) {
                // Add player id
                msg.AddRange(BitConverter.GetBytes(pair.Item1));
                addPlayerInfo(pair.Item1, ref infoBytes);
            }
            #if DEBUG
            msg.AddRange(BitConverter.GetBytes((ushort)(255)));
            infoBytes.Add((byte)0);
            infoBytes.Add((byte)0);
            var nameBytes = MessageHelper.stringToBytes("TestPlayer");
            // Safe to be byte as max length = 32
            infoBytes.Add(Convert.ToByte(nameBytes.Length));
            infoBytes.AddRange(nameBytes);
            #endif
            msg.AddRange(infoBytes);

            Send(
                msg.ToArray()
            );
        }

        /*
        == MSG ==
        <Cmd = 1>
        <Id = 2>
        <Info = addPlayerInfo>
        */
        public static void BroadcastPlayerJoin(Player player) {
            List<byte> msg = new List<byte>();
            msg.Add((byte)SendMessageType.PlayerJoin);
            msg.AddRange(BitConverter.GetBytes(PlayerIDManager.IDToUsername.Reverse[player.Name]));
            addPlayerInfo(player, ref msg);

            Self.Sessions.Broadcast(msg.ToArray());
        }

        /*
        == MSG ==
        <Cmd = 1>
        <Id = 2>
        */
        public static void BroadcastPlayerLeave(Player player) {
            Self.Sessions.Broadcast(MessageHelper.withCommand(
                SendMessageType.PlayerLeave,
                BitConverter.GetBytes(
                    PlayerIDManager.IDToUsername.Reverse[player.Name]
                )
            ));
        }

        /*
        Better for JS to keep ids first then positions
        MSG STRUCTURE = <CMD BYTE = 1> <PlayerIds = 2*COUNT> <PlayerPositions = 12*COUNT>
        LENGTH = 1 + (2 + 12) * COUNT = 1 + 14 * COUNT
        */
        public static void BroadcastPlayerPositions() {
            
            // Dont broadcast empty positions
            #if DEBUG
            byte[] msg = new byte[1 + 18 * (PlayerIDManager.IDToUsername.Count() + 1)];
            #else
            if(PlayerIDManager.IDToUsername.Count() == 0) return;
            byte[] msg = new byte[1 + 18 * PlayerIDManager.IDToUsername.Count()];
            #endif
            msg[0] = (byte)SendMessageType.Position;
            int offset = 1;
            foreach(var id in PlayerIDManager.GetIDEnumerator()) {
                BitConverter.GetBytes(id).CopyTo(msg, offset);
                var pos = PlayerIDManager.GetPosition(id);
                var data = PlayerIDManager.GetPlayerInternal(id).LastMovement.Move;
                BitConverter.GetBytes(data.Position.X).CopyTo(msg, offset + 2);
                BitConverter.GetBytes(data.Position.Y).CopyTo(msg, offset + 6);
                BitConverter.GetBytes(data.Position.Z).CopyTo(msg, offset + 10);
                BitConverter.GetBytes(data.Direction).CopyTo(msg, offset + 14);
                offset += 18;
            }
            #if DEBUG
            {
                // Manager.Ticks
                float angle = ((float)Manager.Ticks / 100f) % 360 - 180;
                float x = 357728 + (float)Math.Cos(angle) * 20000f;
                float y = -448836 + (float)Math.Sin(angle) * 20000f;
                float z = -82809;
                BitConverter.GetBytes((ushort)255).CopyTo(msg, offset);
                // 357728 -448836 -82809
                BitConverter.GetBytes(x).CopyTo(msg, offset + 2);
                BitConverter.GetBytes(y).CopyTo(msg, offset + 6);
                BitConverter.GetBytes(z).CopyTo(msg, offset + 10);
                BitConverter.GetBytes((float)(Manager.Ticks % 360 - 180)).CopyTo(msg, offset + 14);
            }
            #endif
            Self.Sessions.Broadcast(msg);
        }
    }
}