export function GetPosition(elementId)
{
    const element = document.getElementById(elementId);
    if (element)
    {
        const rect = element.getBoundingClientRect();
        return {
            X: rect.left + window.scrollX,
            Y: rect.top + window.scrollY
        };
    }
    return null;
}

export function GetSize(elementId)
{
    const element = document.getElementById(elementId);
    if (element)
    {
        return {
            X: element.offsetWidth,
            Y: element.offsetHeight
        };
    }
    return null;   
}