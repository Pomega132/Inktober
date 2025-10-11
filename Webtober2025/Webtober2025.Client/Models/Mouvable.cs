namespace Webtober2025.Client.Models
{
    public class Mouvable : Rect
    {

        public Point Velocity { get; set; } = new Point(0, 0);

        public void Update()
        {
            Position.X += Velocity.X;
            Position.Y += Velocity.Y;
        }
    }
}
