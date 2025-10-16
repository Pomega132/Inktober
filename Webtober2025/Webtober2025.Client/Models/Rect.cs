namespace Webtober2025.Client.Models
{
    public class Rect
    {
        public Point Position { get; set; } = new Point(0, 0);
        public Point Size { get; set; } = new Point(100, 100);

        public Rect() { }

        public Rect(Point position, Point size)
        {
            Position = position;
            Size = size;
        }

        public Rect(int x, int y, int width, int height)
        {
            Position = new Point(x, y);
            Size = new Point(width, height);
        }

        public bool IsColliding(Rect other)
        {
            return !(Position.X > other.Position.X + other.Size.X ||
                     Position.X + Size.X < other.Position.X ||
                     Position.Y > other.Position.Y + other.Size.Y ||
                     Position.Y + Size.Y < other.Position.Y);
        }
    }
}
