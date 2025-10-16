namespace Webtober2025.Client.Models
{
    public class MouseState
    {
        public bool IsDown { get; set; } = false;
        public Point Position { get; set; } = new Point(0, 0);
    }
}
