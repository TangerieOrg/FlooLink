using System.Text;

namespace FlooLink
{

    public enum SendMessageType : byte {
        Test = 0,
        PlayerList = 1,
        PlayerJoin = 2,
        PlayerLeave = 3
    }

    public enum RecieveMessageType : byte {
        Test = 0
    }

    public static class MessageHelper {
        public static byte LIST_SEP_BYTE = 0x1F; // Unit Separator
        public static char LIST_SEP_CHAR = Convert.ToChar(LIST_SEP_BYTE);

        public static byte[] stringToBytes(string str) {
            return Encoding.ASCII.GetBytes(str);
        }

        public static byte[] stringToBytes(byte[] existing, string str) {
            byte[] final = new byte[existing.Length + Encoding.ASCII.GetByteCount(str)];
            existing.CopyTo(final, 0);
            stringToBytes(str).CopyTo(final, existing.Length);
            return final;
        }

        public static byte[] stringToBytes(SendMessageType cmd, string str) {
            byte[] final = new byte[Encoding.ASCII.GetByteCount(str) + 1];
            final[0] = (byte)cmd;
            stringToBytes(str).CopyTo(final, 1);
            return final;
        }

        public static byte[] withCommand(SendMessageType cmd, byte[] data) {
            byte[] final = new byte[data.Length + 1];
            final[0] = (byte)cmd;
            data.CopyTo(final, 1);
            return final;
        }

        public static byte[] stringEnumerableToBytes(IEnumerable<string> data) {
            var joined = String.Join(LIST_SEP_CHAR, data);
            return stringToBytes(joined);
        }
    }

}