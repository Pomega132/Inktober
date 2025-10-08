using Tools.Core.Attributes;

namespace Webtober2025.Client.Models._06
{
    public class Inventaire
    {
        public List<ItemStack> Items { get; set; } = [];

        public Pickaxe Pickaxe { get; set; } = E_Pickaxe.WOOD.GetPickaxe();

        public void PickaxeWornOut()
        {
            if (Pickaxe.Durability != int.MaxValue)
                Pickaxe.Durability--;

            if (Pickaxe.Durability < 1)
                Pickaxe = E_Pickaxe.WOOD.GetPickaxe();
        }

        public void Add(E_Item item, int qty = 1)
        {
            if (item == E_Item.NONE)
                return;

            ItemStack? stack = Items.FirstOrDefault(i => i.Item == item);
            if (stack is null)
            {
                Items.Add(new ItemStack()
                {
                    Item = item,
                    Quantity = qty
                });
            }
            else
            {
                stack.Quantity += qty;
            }
        }

        public bool Has(E_Item item, int minQty = 1) => Items.Any(i => i.Item == item && i.Quantity >= minQty);

        public void FoudreIron()
        {
            if (Has(E_Item.RAW_IRON, 8) && Has(E_Item.COAL))
            {
                ItemStack stackRawIron = Items.First(i => i.Item == E_Item.RAW_IRON);
                stackRawIron.Quantity -= 8;

                ItemStack stackCoal = Items.First(i => i.Item == E_Item.COAL);
                stackCoal.Quantity--;

                Add(E_Item.IRON_INGOT, 8);
            }
        }

        public void FoudreGold()
        {
            if (Has(E_Item.RAW_GOLD, 8) && Has(E_Item.COAL))
            {
                ItemStack stackRawGold = Items.First(i => i.Item == E_Item.RAW_GOLD);
                stackRawGold.Quantity -= 8;
                ItemStack stackCoal = Items.First(i => i.Item == E_Item.COAL);
                stackCoal.Quantity--;
                Add(E_Item.GOLD_INGOT, 8);
            }
        }

        public bool PickaxeCanBeUpgrade()
        {
            switch (Pickaxe.Type)
            {
                case E_Pickaxe.WOOD:
                    return Has(E_Item.RAW_IRON);
                case E_Pickaxe.STONE:
                    return Has(E_Item.IRON_INGOT, 5);
                case E_Pickaxe.IRON:
                    return Has(E_Item.GOLD_INGOT, 8);
                case E_Pickaxe.GOLD:
                    return Has(E_Item.GOLD_INGOT, 10);
                case E_Pickaxe.DIAMOND:
                    return false;
                default:
                    return false;
            }
        }

        public void PickaxeUpgrade()
        {
            if (!PickaxeCanBeUpgrade())
                return;
            switch (Pickaxe.Type)
            {
                case E_Pickaxe.WOOD:
                    {
                        ItemStack stackRawIron = Items.First(i => i.Item == E_Item.RAW_IRON);
                        stackRawIron.Quantity--;
                        Pickaxe = E_Pickaxe.STONE.GetPickaxe();
                        break;
                    }
                case E_Pickaxe.STONE:
                    {
                        ItemStack stackIronIngot = Items.First(i => i.Item == E_Item.IRON_INGOT);
                        stackIronIngot.Quantity -= 5;
                        Pickaxe = E_Pickaxe.IRON.GetPickaxe();
                        break;
                    }
                case E_Pickaxe.IRON:
                    {
                        ItemStack stackGoldIngot = Items.First(i => i.Item == E_Item.GOLD_INGOT);
                        stackGoldIngot.Quantity -= 8;
                        Pickaxe = E_Pickaxe.GOLD.GetPickaxe();
                        break;
                    }
                case E_Pickaxe.GOLD:
                    {
                        ItemStack stackGoldIngot = Items.First(i => i.Item == E_Item.GOLD_INGOT);
                        stackGoldIngot.Quantity -= 10;
                        Pickaxe = E_Pickaxe.DIAMOND.GetPickaxe();
                        break;
                    }
            }
        }
    }

    public class ItemStack
    {
        public E_Item Item { get; set; }
        public int Quantity { get; set; } = 0;
    }

    public enum E_Item
    {
        NONE = 0,
        [Label("Coal")]
        COAL,
        [Label("Raw_Iron")]
        RAW_IRON,
        [Label("Raw_Gold")]
        RAW_GOLD,
        [Label("Iron_Ingot")]
        IRON_INGOT,
        [Label("Gold_Ingot")]
        GOLD_INGOT,
        [Label("Diamond")]
        DIAMOND,
        [Label("Lapis_Lazuli")]
        LAPIS_LAZULI,
        [Label("Redstone_Dust")]
        REDSTONE,
    }
}
