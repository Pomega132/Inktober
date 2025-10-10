namespace Webtober2025.Client.Models
{
    public class Point(double x, double y)
    {
        public double X { get; set; } = x;
        public double Y { get; set; } = y;

        public override bool Equals(object? obj)
        {
            if (obj is not Point p) return false;
            return this == p;
        }
        public override int GetHashCode() => HashCode.Combine(X, Y);

        public static bool operator ==(Point a, Point b) => a.X == b.X && a.Y == b.Y;
        public static bool operator !=(Point a, Point b) => !(a == b);
    }
}
