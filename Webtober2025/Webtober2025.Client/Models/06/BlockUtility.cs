using Tools.Core;

namespace Webtober2025.Client.Models._06
{
    [AttributeUsage(AttributeTargets.Field, Inherited = false, AllowMultiple = false)]
    sealed class BlockAttribute(double probability, bool isMinerai, E_Item drop, int minDeep = 0, int maxDeep = int.MaxValue) : Attribute
    {
        public double Probability { get; } = probability;
        public bool IsMinerai { get; } = isMinerai;
        public int MinDeep { get; } = minDeep;
        public int MaxDeep { get; } = maxDeep;
        public E_Item Drop { get; } = drop;

        public bool IsValid(int deep) => deep >= MinDeep && deep <= MaxDeep;

        public double GetProbability(E_Block block, int deep)
        {
            switch (block)
            {
                case E_Block.AIR:
                    return block.GetProbability();
                case E_Block.STONE:
                    if (deep < E_Block.DEEPSLATE.GetMin())
                        return block.GetProbability();

                    if (deep < E_Block.STONE.GetMax())
                    {
                        int range = E_Block.STONE.GetMax() - E_Block.DEEPSLATE.GetMin();
                        double adjustedDeep = block.GetProbability() / range;
                        double decalage = E_Block.STONE.GetMax() * adjustedDeep;

                        double result = (deep * adjustedDeep) - decalage;

                        return result;
                    }

                    return 0;
                case E_Block.DEEPSLATE:
                    if (deep < E_Block.DEEPSLATE.GetMin())
                        return 0;

                    if (deep < E_Block.STONE.GetMax())
                    {
                        int range = E_Block.STONE.GetMax() - E_Block.DEEPSLATE.GetMin();
                        double adjustedDeep = block.GetProbability() / range;
                        double decalage = E_Block.STONE.GetMax() * adjustedDeep;

                        double result = block.GetProbability() - (deep * adjustedDeep) + decalage;

                        return result;
                    }

                    return block.GetProbability();
                case E_Block.COAL_ORE:
                    if (deep < E_Block.DEEPSLATE.GetMin())
                        return block.GetProbability();

                    if (deep < E_Block.COAL_ORE.GetMax())
                    {
                        int range = E_Block.COAL_ORE.GetMax() - E_Block.DEEPSLATE.GetMin();
                        double adjustedDeep = block.GetProbability() / range;
                        double decalage = E_Block.COAL_ORE.GetMax() * adjustedDeep;

                        double result = (deep * adjustedDeep) - decalage;

                        return result;
                    }

                    return 0;
                case E_Block.IRON_ORE:
                case E_Block.GOLD_ORE:
                case E_Block.DIAMOND_ORE:
                case E_Block.REDSTONE_ORE:
                case E_Block.LAPIS_ORE:
                    return block.GetProbability();
                default:
                    return 0;
            }
        }
    }

    public static class BlockUtility
    {
        public static double GetProbability(this E_Block value)
        {
            Type type = value.GetType();
            string? name = Enum.GetName(type, value);
            if (name == null)
                return 0;
            System.Reflection.FieldInfo? field = type.GetField(name);
            if (field == null)
                return 0;
            BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;
            if (attr == null)
                return 0;
            return attr.Probability;
        }

        public static bool IsMinerai(this E_Block value)
        {
            Type type = value.GetType();
            string? name = Enum.GetName(type, value);
            if (name == null)
                return false;
            System.Reflection.FieldInfo? field = type.GetField(name);
            if (field == null)
                return false;
            BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;
            if (attr == null)
                return false;
            return attr.IsMinerai;
        }

        public static int GetMin(this E_Block value)
        {
            Type type = value.GetType();
            string? name = Enum.GetName(type, value);
            if (name == null)
                return 0;
            System.Reflection.FieldInfo? field = type.GetField(name);
            if (field == null)
                return 0;
            BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;
            if (attr == null)
                return 0;
            return attr.MinDeep;
        }

        public static int GetMax(this E_Block value)
        {
            Type type = value.GetType();
            string? name = Enum.GetName(type, value);
            if (name == null)
                return int.MaxValue;
            System.Reflection.FieldInfo? field = type.GetField(name);
            if (field == null)
                return int.MaxValue;
            BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;
            if (attr == null)
                return int.MaxValue;
            return attr.MaxDeep;
        }

        public static bool IsValid(this E_Block value, int deep)
        {
            Type type = value.GetType();
            string? name = Enum.GetName(type, value);

            if (name == null)
                return false;

            System.Reflection.FieldInfo? field = type.GetField(name);

            if (field == null)
                return false;

            BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;

            if (attr == null)
                return false;

            return attr.IsValid(deep);
        }

        public static IEnumerable<Block> GetValidBlocks(int deep)
        {
            Type type = typeof(E_Block);

            foreach (E_Block value in Enum.GetValues(typeof(E_Block)))
            {
                string? name = Enum.GetName(type, value);

                if (name == null)
                    continue;

                System.Reflection.FieldInfo? field = type.GetField(name);

                if (field == null)
                    continue;

                BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;

                if (attr == null)
                    continue;

                if (value.IsValid(deep))
                {
                    yield return new Block(value, attr.Probability, attr.IsMinerai);
                }
            }
        }

        public static E_Item GetDrop(this E_Block value)
        {
            Type type = value.GetType();
            string? name = Enum.GetName(type, value);
            if (name == null)
                return E_Item.NONE;
            System.Reflection.FieldInfo? field = type.GetField(name);
            if (field == null)
                return E_Item.NONE;
            BlockAttribute? attr = Attribute.GetCustomAttribute(field, typeof(BlockAttribute)) as BlockAttribute;
            if (attr == null)
                return E_Item.NONE;
            return attr.Drop;
        }

        public static E_Item Drop(this E_Block value)
        {
            IEnumerable<E_Block> flags = value.GetFlags();

            return flags.FirstOrDefault(f => f.GetDrop() != E_Item.NONE).GetDrop();
        }
    }

    [Flags]
    public enum E_Block
    {
        [Block(100, true, E_Item.NONE)]
        AIR,
        [Block(100, false, E_Item.NONE, 0, 120)]
        STONE = 1,
        [Block(100, false, E_Item.NONE, 100)]
        DEEPSLATE = 2,
        [Block(5, true, E_Item.COAL, 0, 120)]
        COAL_ORE = 4,
        [Block(5, true, E_Item.RAW_IRON)]
        IRON_ORE = 8,
        [Block(3, true, E_Item.RAW_GOLD)]
        GOLD_ORE = 16,
        [Block(1, true, E_Item.DIAMOND)]
        DIAMOND_ORE = 32,
        [Block(5, true, E_Item.REDSTONE)]
        REDSTONE_ORE = 64,
        [Block(3, true, E_Item.LAPIS_LAZULI)]
        LAPIS_ORE = 128,
    }

    public class Block(E_Block type, double probability, bool isMinerai)
    {
        public E_Block Type { get; } = type;
        public double Probability { get; } = probability;
        public bool IsMinerai { get; } = isMinerai;
    }
}