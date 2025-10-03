namespace Webtober2025.Client.Models
{
    public static class RNG
    {
        const string CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        private static Random _RNG { get; } = new Random();

        public static int Next() => _RNG.Next();

        public static int Next(int maxValue) => _RNG.Next(maxValue);

        public static int Next(int minValue, int maxValue) => _RNG.Next(minValue, maxValue);

        public static double NextDouble() => _RNG.NextDouble();

        public static double NextDouble(double maxValue) => _RNG.NextDouble() * maxValue;

        public static double NextDouble(double minValue, double maxValue) => _RNG.NextDouble() * (maxValue - minValue) + minValue;

        public static string KeyGen()
        {
            string key = "";
            for (int i = 0; i < 7; i++)
            {
                key += CHARS[Next(CHARS.Length)];
            }

            return key;
        }
    }
}
