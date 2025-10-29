/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Point} pos
 */
export function RenderGame(pos, move)
{
    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;

    var camOffsetX = GameState.Canvas.width / 2;
    var spriteOffsetX = 0;

    if (pos.x > 0)
        camOffsetX = -(pos.x - GameState.Canvas.width / 2);

    if (camOffsetX < -GameState.Canvas.width * 1.5)
        camOffsetX = -GameState.Canvas.width * 1.5;

    if (camOffsetX != -(pos.x - GameState.Canvas.width / 2))
        spriteOffsetX = camOffsetX + (pos.x - GameState.Canvas.width / 2);

    // Paramètres de la route (haut = horizon, bas = bord écran)
    const horizonY = GameState.Canvas.height * 0.5;
    const bottomY = GameState.Canvas.height;

    // Centre de la route en haut/bas (tu pourras les décaler pour les virages)
    const cxTop = GameState.Canvas.width / 2, cxBottom = GameState.Canvas.width / 2;

    const roadWidthTop = 20; // largeur de la route en haut 
    const roadWidthBottom = GameState.Canvas.width * 2; // largeur de la route en bas 

    // Demi-largeur de la route en haut/bas (en haut ~ 10px comme ton code, en bas large)
    const roadHalfTop = roadWidthTop / 2;
    const roadHalfBottom = roadWidthBottom / 2; // ajuste à ton goût

    // Helpers de lerp
    const lerp = (a, b, t) => a + (b - a) * t;
    const tAtY = (y) => (y - horizonY) / (bottomY - horizonY); // 0..1 du haut vers le bas
    const roadHalfAtY = (y) => lerp(roadHalfTop, roadHalfBottom, tAtY(y));
    const centerXAtY = (y) => lerp(cxTop, cxBottom, tAtY(y));  // utile si tu fais des virages

    // Clear l'arrière-plan (ciel bleu clair)
    GameState.Context.fillStyle = "#0194fe"; // bleu ciel
    GameState.Context.fillRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);

    // Dessiner les nuages dans le ciel sans sprite, juste des cercles blancs avec opacité dégrader.
    DrawClouds(GameState.Context);


    // Dessiner le sol (herbe verte)
    GameState.Context.fillStyle = "#00aa00"; // vert herbe
    GameState.Context.fillRect(0, GameState.Canvas.height / 2, GameState.Canvas.width, GameState.Canvas.height / 2);

    // Dessiner le la route jusqu'a l'horizon. Il n'y a pas de sprite, donc on va tous dessiner avec des formes.
    GameState.Context.fillStyle = "gray";
    GameState.Context.beginPath();
    GameState.Context.moveTo(0 + camOffsetX, GameState.Canvas.height);
    GameState.Context.lineTo(roadWidthBottom + camOffsetX, GameState.Canvas.height);
    GameState.Context.lineTo(GameState.Canvas.width / 2 + 10, GameState.Canvas.height / 2);
    GameState.Context.lineTo(GameState.Canvas.width / 2 - 10, GameState.Canvas.height / 2);
    GameState.Context.closePath();
    GameState.Context.fill();


    // Dessiner les lignes blanches au centre de la route.
    // --- Liserés bas-côtés (optionnel, ça aide la perception) ---
    const edgeFrac = 0.06; // largeur relative du liseré
    //drawStrip(GameState.Context, horizonY, bottomY, (y) =>
    //{
    //    const cx = centerXAtY(y);
    //    const rw = roadHalfAtY(y);
    //    return {
    //        leftIn: cx - rw,
    //        leftOut: cx - rw * (1 + edgeFrac),
    //        rightIn: GameState.Canvas.width / 2 + 10,
    //        rightOut: GameState.Canvas.width * (1 + edgeFrac)
    //    };
    //}, "#e7e7e7");
    drawDashesByBottomX(GameState.Context, {
        horizonY: horizonY,
        bottomY: bottomY,
        RoadWidth: GameState.Canvas.width * 2,
        bottomX: GameState.Canvas.width * edgeFrac + camOffsetX,  // centre en bas
        centerXAtY,
        roadHalfAtY: roadHalfAtY,
        // proportion de la largeur route dédiée à la ligne
        lineFrac: 0.01,       // ~5% de la demi-largeur (ajuste)
        dashLenNear: 80,      // longueur d’un tiret près de la caméra
        dashLenFar: 8,        // longueur d’un tiret près de l’horizon
        gapScale: 0.6,        // 0.6 => l’espace fait ~60% de la longueur
        style: { type: 'solid', color: '#e7e7e7' }
        //color: "white"
    });

    drawDashesByBottomX(GameState.Context, {
        horizonY: horizonY,
        bottomY: bottomY,
        RoadWidth: GameState.Canvas.width * 2,
        bottomX: GameState.Canvas.width * (2 - edgeFrac) + camOffsetX,  // centre en bas
        centerXAtY,
        roadHalfAtY: roadHalfAtY,
        // proportion de la largeur route dédiée à la ligne
        lineFrac: 0.01,       // ~5% de la demi-largeur (ajuste)
        dashLenNear: 80,      // longueur d’un tiret près de la caméra
        dashLenFar: 8,        // longueur d’un tiret près de l’horizon
        gapScale: 1.2,        // 0.6 => l’espace fait ~60% de la longueur
        style: { type: 'solid', color: '#e7e7e7' }
        //color: "white"
    });

    const NB_LINES = 5;
    for (var i = 1; i < NB_LINES + 1; i++)
    {
        // --- Ligne centrale en QUADS perspective ---
        drawDashesByBottomX(GameState.Context, {
            horizonY: horizonY,
            bottomY: bottomY,
            bottomX: roadWidthBottom * i / (NB_LINES + 1) + camOffsetX,  // centre en bas
            centerXAtY,
            roadHalfAtY: roadHalfAtY,
            Offset: pos.y,
            // proportion de la largeur route dédiée à la ligne
            lineFrac: 0.01,       // ~5% de la demi-largeur (ajuste)
            dashLenNear: 80,      // longueur d’un tiret près de la caméra
            dashLenFar: 8,        // longueur d’un tiret près de l’horizon
            gapScale: 0.6,        // 0.6 => l’espace fait ~60% de la longueur
            //color: "white"
        });
    }

    // Exemple d'utilisation à la fin de RenderGame :
    //ApplyPixelizer(GameState.Context, 4);

    // TODO Dessiner des arbres sur les côtés de la route espacé régulièrement.
    

    // Dessiner la voiture du joueur au centre bas de l'écran.
    const spriteSize = new Point(79, 44);
    const spriteScale = 3.0;
    var sprite;
    if (move === true)
        sprite = GameState.Textures.GetImage("VoitureDroite", GameState.FrameCount);
    else if (move === false)
        sprite = GameState.Textures.GetImage("VoitureGauche", GameState.FrameCount);
    else
        sprite = GameState.Textures.GetImage("Voiture", GameState.FrameCount);

    GameState.Context.drawImage(
        sprite,
        GameState.Canvas.width / 2 + spriteOffsetX - spriteSize.x * spriteScale / 2,
        bottomY - spriteSize.y * spriteScale - 15,
        spriteSize.x * spriteScale,
        spriteSize.y * spriteScale);
}

/**
 * Créé des nuages dans le ciel à positions fixe de façon procédurale pour avoir toujours les mêmes.
 * @param {any} ctx
 */
function DrawClouds(ctx)
{
    // Génération déterministe de nuages variés, couvrant toute la zone (1000,400) et débordant un peu
    const clouds = [];
    const cloudGroups = [
        { count: 5, cx: 200, cy: 100, spread: 80, rBase: 60 },
        { count: 4, cx: 800, cy: 80, spread: 120, rBase: 70 },
        { count: 6, cx: 500, cy: 200, spread: 150, rBase: 55 },
        { count: 4, cx: 950, cy: 350, spread: 100, rBase: 65 },
        { count: 3, cx: 100, cy: 350, spread: 90, rBase: 50 },
        { count: 5, cx: 600, cy: 350, spread: 130, rBase: 60 },
        { count: 3, cx: 1050, cy: 50, spread: 60, rBase: 45 }, // déborde à droite
        { count: 2, cx: -50, cy: 60, spread: 40, rBase: 40 },  // déborde à gauche
        { count: 2, cx: 500, cy: -40, spread: 80, rBase: 55 }, // déborde en haut
        { count: 2, cx: 500, cy: 420, spread: 80, rBase: 55 }  // déborde en bas
    ];

    // Générateur pseudo-aléatoire déterministe
    function seededRandom(seed)
    {
        var x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    let cloudIdx = 0;
    for (let group of cloudGroups)
    {
        for (let i = 0; i < group.count; i++)
        {
            // Position déterministe dans le groupe, rayon variable
            const angle = seededRandom(cloudIdx * 3.1 + 1.7) * Math.PI * 2;
            const dist = seededRandom(cloudIdx * 2.3 + 2.9) * group.spread;
            const x = group.cx + Math.cos(angle) * dist;
            const y = group.cy + Math.sin(angle) * dist;
            const r = group.rBase * (0.7 + seededRandom(cloudIdx * 1.5 + 4.2) * 0.7);
            clouds.push({ x, y, r, idx: cloudIdx });
            cloudIdx++;
        }
    }

    for (let cloud of clouds)
    {
        // Nuage principal
        const gradient = ctx.createRadialGradient(cloud.x, cloud.y, cloud.r * 0.3, cloud.x, cloud.y, cloud.r);
        gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
        ctx.fill();

        // Extensions "fluffy" déterministes
        const extCount = 3 + Math.floor(seededRandom(cloud.idx * 5.7 + 7.3) * 3);
        for (let i = 0; i < extCount; i++)
        {
            const angle = Math.PI * 2 * (i / extCount) + seededRandom(cloud.idx * 2.1 + i * 3.3) * 0.5;
            const dx = Math.cos(angle) * cloud.r * (0.5 + seededRandom(cloud.idx * 1.9 + i * 2.7) * 0.5);
            const dy = Math.sin(angle) * cloud.r * (0.2 + seededRandom(cloud.idx * 2.5 + i * 1.1) * 0.5);
            const r2 = cloud.r * (0.4 + seededRandom(cloud.idx * 3.2 + i * 2.8) * 0.3);
            const grad2 = ctx.createRadialGradient(cloud.x + dx, cloud.y + dy, r2 * 0.3, cloud.x + dx, cloud.y + dy, r2);
            grad2.addColorStop(0, 'rgba(255,255,255,0.7)');
            grad2.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad2;
            ctx.beginPath();
            ctx.arc(cloud.x + dx, cloud.y + dy, r2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * Applique un effet "pixeliser" sur le contexte du canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pixelSize Taille du "pixel" (ex: 4, 8, 16)
 */
function ApplyPixelizer(ctx, pixelSize)
{
    const canvas = ctx.canvas;
    // Crée une image temporaire
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width / pixelSize;
    tempCanvas.height = canvas.height / pixelSize;
    const tempCtx = tempCanvas.getContext('2d');

    // Dessine l'image réduite
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    // Désactive le lissage pour effet pixel
    ctx.imageSmoothingEnabled = false;

    // Redessine l'image agrandie (pixelisée)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
}

function drawDashesByBottomX(ctx, {
    horizonY, bottomY,
    bottomX,               // position bas
    RoadWidth,             // pour connaître l'épaisseur en bas
    centerXAtY,            // pour suivre la courbure de la route
    roadHalfAtY,           // pour connaître l'épaisseur en haut
    Offset = 0,
    lineFrac = 0.05,
    dashLenNear = 60,
    dashLenFar = 6,
    gapScale = 0.6,
    style = null     // [{type:'dashed'|'solid', color}, ...]
})
{

    // style par défaut
    if (!style)
        style = { type: 'dashed', color: 'white' };
    ctx.fillStyle = style.color || 'white';

    const tAt = (y) => (y - horizonY) / (bottomY - horizonY);
    const lineHalfAt = (y) => Math.max(1, roadHalfAtY(y) * lineFrac);

    // --- Nouvelle: conserver la fraction latérale s entre bas et haut ---
    const centerBottom = centerXAtY(bottomY);
    const halfBottom = Math.max(1e-3, roadHalfAtY(bottomY)); // évite division par 0
    const s = (bottomX - centerBottom) / halfBottom;           // -1..+1 typiquement

    // x à une ordonnée y : même s, demi-largeur qui varie avec la perspective
    const xAtY = (y) => centerXAtY(y) + s * roadHalfAtY(y);

    if (style.type === 'solid')
    {
        const step = 6;
        for (let y1 = bottomY; y1 > horizonY;)
        {
            const y2 = Math.max(horizonY, y1 - step);
            const lh1 = lineHalfAt(y1);
            const lh2 = lineHalfAt(y2);
            const x1 = xAtY(y1), x2 = xAtY(y2);
            drawQuad(ctx, x2 - lh2, y2, x2 + lh2, y2, x1 + lh1, y1, x1 - lh1, y1);
            y1 = y2;
        }
    } else
    {
        let y = bottomY + Offset % (dashLenNear * (1 + (gapScale * 2)));;
        while (y > horizonY)
        {
            const t1 = tAt(y);
            const dashLen1 = dashLenFar + (dashLenNear - dashLenFar) * t1;
            const y2 = Math.max(horizonY, y - dashLen1);

            const x1 = xAtY(y), x2 = xAtY(y2);
            const lh1 = lineHalfAt(y), lh2 = lineHalfAt(y2);

            drawQuad(ctx, x2 - lh2, y2, x2 + lh2, y2, x1 + lh1, y, x1 - lh1, y);

            const gap = dashLen1 * gapScale;
            y = y2 - gap;
        }
    }
}

// utilitaire quad
function drawQuad(ctx, x1, y1, x2, y2, x3, y3, x4, y4)
{
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
}

export class Textures
{
    Texture = {};
    TextureIds = {
        Voiture: "Voiture",
        VoitureDroite: "VoitureDroite",
        VoitureGauche: "VoitureGauche",
        Arbre: "Arbre"
    };
    FrameRate = 10;

    /**
     * 
     * @param {string} textureName
     * @param {number?} frameCount
     * @returns {HTMLImageElement}
     */
    GetImage(textureName, frameCount)
    {
        var texture = this.Texture[textureName];

        if (!texture)
            return null;

        if (Array.isArray(texture))
        {
            var frame = Math.floor(frameCount / (60 / this.FrameRate)) % texture.length;
            return texture[frame];
        }
        return texture;
    }

    constructor()
    {
        const day = 26;

        for (var textureName in this.TextureIds)
        {
            var texture = this.TextureIds[textureName];

            if (typeof texture === "number")
            {
                for (var i = 0; i < texture; i++)
                {
                    var img = new Image();
                    img.src = `/Images/2025/${day}/${textureName}/${i}.png`;
                    if (!this.Texture[textureName])
                    {
                        this.Texture[textureName] = [];
                    }
                    this.Texture[textureName].push(img);
                }
            }
            if (typeof texture === "string")
            {
                var img = new Image();
                img.src = `/Images/2025/${day}/${texture}.png`;
                this.Texture[textureName] = img;
            }
        }
    }
}

export class GameStateInfo
{

    constructor()
    {
        /** @type {HTMLCanvasElement} */
        this.Canvas = document.getElementById("game");
        this.Context = this.Canvas.getContext("2d");
        this.Textures = new Textures();
    }
}

export class Rect
{
    constructor()
    {
        this.position = new Point(0, 0);
        this.size = new Point(100, 100);
    }
}

export class Point
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
}