namespace FlooLink
{
    public static class Logger {
        public static void Information(params string[] msgs) {
            var str = String.Join(" ", msgs);
            Manager.instance.server.Information("[FlooLink] " + str);
        }
        public static void Debug(params string[] msgs) {
            #if DEBUG
            Information(msgs);
            #endif
        }
    }
}