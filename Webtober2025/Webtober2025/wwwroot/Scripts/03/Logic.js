export var IntervalId = null;

export function GetBoundingClientRect(element) {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
        width: rect.width,
        height: rect.height,
    };
}

export function StartWindowMoveWatcher(dotNetHelper) {
    var LastX = window.screenX, LastY = window.screenY;
    setInterval(async () => {
        if (window.screenX !== LastX || window.screenY !== LastY) {
            var deltaX = window.screenX - LastX;
            var deltaY = window.screenY - LastY;
            LastX = window.screenX;
            LastY = window.screenY;
            var delta = JSON.stringify({ Item1: deltaX, Item2: deltaY });
            await dotNetHelper.invokeMethodAsync("AddVelocity", delta);
        }
    }, 200); // toutes les 200 ms
}

export function StopWindowMoveWatcher() {
    if (IntervalId) {
        clearInterval(IntervalId);
        IntervalId = null;
    }
}