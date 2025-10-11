export async function PrintWeb() {
    const el = document.getElementById("Web");
    if (!el) throw new Error("SVG introuvable");

    // Clone propre + assure xmlns + width/height depuis le viewBox
    const clone = el.cloneNode(true);
    clone.removeAttribute("style");
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    if (clone.lastChild.nodeName == "circle")
        clone.removeChild(clone.lastChild);

    const w = el.getBBox().width;
    const h = el.getBBox().height;

    clone.setAttribute("width", w);
    clone.setAttribute("height", h);

    // Sérialisation
    const xml = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    // Image -> Canvas
    const img = new Image();
    // Si votre SVG référence des images externes, décommentez et servez-les avec CORS:
    // img.crossOrigin = "anonymous";
    const loadPromise = new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = (e) => rej(e);
    });
    img.src = url;
    await loadPromise;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    URL.revokeObjectURL(url);

    // Téléchargement
    const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
    const aUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = aUrl;
    a.download = "Toile.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(aUrl);
}