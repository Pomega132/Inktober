using Microsoft.AspNetCore.Components.Web;

namespace Webtober2025.Client.Models
{
    public interface IMouseState
    {
        MouseState MouseState { get; set; } 

        #region Mouse Events
        void ClickDown(MouseEventArgs args)
        {
            MouseState.IsDown = true;
        }

        void ClickUp(MouseEventArgs args)
        {
            MouseState.IsDown = false;
        }

        void MouseMove(MouseEventArgs args)
        {
            MouseState.Position = new Point((int)args.OffsetX, (int)args.OffsetY);
        }
        #endregion
    }
}
