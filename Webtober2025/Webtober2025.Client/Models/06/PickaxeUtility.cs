namespace Webtober2025.Client.Models._06
{
    [System.AttributeUsage(AttributeTargets.Field, Inherited = false, AllowMultiple = false)]
    sealed class PickaxeAttribute(string imageName, double efficiency, int durability = int.MaxValue) : Attribute
    {
        public string ImageName { get; } = imageName;
        public int? Durability { get; } = durability;
        public double Efficiency { get; } = efficiency;
    }

    public static class PickaxeUtility
    {
        public static Pickaxe GetPickaxe(this E_Pickaxe pickaxe)
        {
            var type = pickaxe.GetType();
            var memInfo = type.GetMember(pickaxe.ToString());
            var attributes = memInfo[0].GetCustomAttributes(typeof(PickaxeAttribute), false);
            var attribute = (PickaxeAttribute)attributes[0];
            return new Pickaxe()
            {
                Name = attribute.ImageName,
                Type = pickaxe,
                Durability = attribute.Durability ?? int.MaxValue,
                Efficiency = attribute.Efficiency
            };
        }

        public static string GetImageName(this E_Pickaxe pickaxe)
        {
            var type = pickaxe.GetType();
            var memInfo = type.GetMember(pickaxe.ToString());
            var attributes = memInfo[0].GetCustomAttributes(typeof(PickaxeAttribute), false);
            var attribute = (PickaxeAttribute)attributes[0];
            return attribute.ImageName;
        }
    }

    public class Pickaxe
    {
        public string Name { get; set; } = "Wooden";
        public E_Pickaxe Type { get; set; } = E_Pickaxe.WOOD;
        public int Durability { get; set; } = 100;
        public double Efficiency { get; set; } = 0.12;

    }

    public enum E_Pickaxe
    {
        [Pickaxe("Wooden", 0.046)]
        WOOD,
        [Pickaxe("Stone", 0.07, 250)]
        STONE,
        [Pickaxe("Iron", 0.14, 350)]
        IRON,
        [Pickaxe("Golden", 0.16, 100)]
        GOLD,
        [Pickaxe("Diamond", 0.4, 500)]
        DIAMOND,
    }
}
