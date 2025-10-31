export function Save(datas)
{
    localStorage.setItem("Webtober2025_31_Datas", JSON.stringify(datas));
}

export function Load()
{
    let datas = localStorage.getItem("Webtober2025_31_Datas");
    if (datas)
    {
        return JSON.parse(datas);
    }
    return null;
}