using Microsoft.AspNetCore.Components.Web;
using static Webtober2025.Client.Models.IKeyState;
using System.Runtime.ConstrainedExecution;

namespace Webtober2025.Client.Models
{
    public interface IKeyState
    {
        List<E_Controle> KeysPressed { get; }
        KeyControles Controles { get; }

        public void AddKeyPress(KeyboardEventArgs args)
        {
            E_Controle? controle = Controles.GetControle(args.Code);
            if (controle == null)
                return;

            //OnKeyDown?.Invoke(controle.Value);

            if (!KeysPressed.Contains(controle.Value))
                KeysPressed.Add(controle.Value);
        }

        public void RemoveKeyPress(KeyboardEventArgs args)
        {
            E_Controle? controle = Controles.GetControle(args.Code);

            if (controle == null)
                return;

            //OnKeyUp?.Invoke(controle.Value);

            if (KeysPressed.Contains(controle.Value))
                KeysPressed.Remove(controle.Value);
        }

        public enum E_Controle
        {
            LEFT,
            RIGHT,
            UP,
            DOWN,
            JUMP,
            ACTION,
            PAUSE,
            DEBUG
        }

        public class KeyControles : List<KeyControle>
        {
            public E_Controle? GetControle(string key)
            {
                foreach (var controle in this)
                {
                    if (controle.KeysBinding.Contains(key))
                    {
                        return controle.C;
                    }
                }

                return null;
            }
        }

        public class KeyControle
        {
            public E_Controle C { get; set; }
            public List<string> KeysBinding { get; set; } = new List<string>();
        }
    }
}
