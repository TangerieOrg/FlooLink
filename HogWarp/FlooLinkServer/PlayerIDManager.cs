using HogWarp.Lib;
using HogWarp.Lib.Game;
using HogWarp.Lib.System;
using HogWarp.Lib.Game.Data;
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
    public static class PlayerIDManager {
        const ushort MAX_ID = 65535;
        public static Map<ushort, string> IDToUsername = new Map<ushort, string>();
        public static Dictionary<ushort, Player> IDToPlayer = new Dictionary<ushort, Player>();
        private static ushort nextId = 0;
        private static Stack<ushort> freeIds = new Stack<ushort>();

        private static ushort getNextID() {
            if(freeIds.Count > 0) return freeIds.Pop();
            var id = nextId;
            nextId++;
            return id;
        }

        public static bool isFull() {
            if(freeIds.Count > 0) return false;
            return nextId > MAX_ID;
        }

        public static ushort RegisterPlayer(Player player) {
            var id = getNextID();
            Logger.Debug(player.Name, "Registered to", id.ToString());

            // Max ID check
            // if(id > MAX_ID)

            IDToUsername.Add(id, player.Name);
            IDToPlayer.Add(id, player);
            return id;
        }

        public static void UnregisterPlayer(ushort id) {
            if(IDToUsername.RemoveForward(id)) {
                freeIds.Push(id);
            }
            IDToPlayer.Remove(id);
        }

        public static void UnregisterPlayer(string username) {
            if(IDToUsername.ContainsReverse(username)) {
                var id = IDToUsername.Reverse[username];
                UnregisterPlayer(id);
            }
        }

        public static void UnregisterPlayer(Player player) {
            UnregisterPlayer(player.Name);
        }

        public static IEnumerable<ushort> GetIDEnumerator() {
            foreach(var id in IDToUsername._forward.Keys) {
                yield return id;
            }
        }

        public static IEnumerable<string> GetUsernameEnumerator() {
            foreach(var username in IDToUsername._reverse.Keys) {
                yield return username;
            }
        }

        public static IEnumerable<Tuple<ushort, string>> GetEnumerator() {
            foreach(var id in GetIDEnumerator()) {
                yield return new Tuple<ushort, string>(id, IDToUsername.Forward[id]);
            }
        }

        public static Player GetPlayer(ushort id) {
            return IDToPlayer[id];
        }

        public static Player GetPlayer(string username) {
            return GetPlayer(IDToUsername.Reverse[username]);
        }

        public unsafe static Character.Internal GetPlayerInternal(ushort id) {
            return *GetPlayer(id).Address;
        }

        public unsafe static Character.Internal GetPlayerInternal(string username) {
            return GetPlayerInternal(IDToUsername.Reverse[username]);
        }

        public unsafe static Vector3 GetPosition(ushort id) {
            return GetPlayerInternal(id).LastMovement.Move.Position;
        }
    }
}