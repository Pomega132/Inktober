
namespace Webtober2025.Client.Models._01
{
    public class Personnage
    {
        public string Id { get; set; } = RNG.KeyGen();
        public int Moustache { get; set; } = 0;
        public int Hue { get; set; } = 20;
        public double Saturation { get; set; } = 0.9;
        public double Lightness { get; set; } = 0.7;
        public E_State State { get; set; } = E_State.ALIVE;

        public static Personnage GenerateRandom() => new Personnage
        {
            Moustache = RNG.Next(0, 30),
            Hue = RNG.Next(0, 360),
            Saturation = Math.Round(RNG.NextDouble(), 2),
            Lightness = Math.Round(RNG.NextDouble(), 2)
        };

        public enum E_State
        {
            ALIVE,
            PLAYER_DEAD,
            BOT_DEAD
        }
    }
}
