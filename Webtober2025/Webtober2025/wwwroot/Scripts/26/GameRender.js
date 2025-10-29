/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Point} Pos
 */
export function RenderGame(Pos)
{
    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;

    var camOffsetX = 0;
    var spriteOffsetX = 0;

    if (Pos.x > GameState.Canvas.width / 2)
        camOffsetX = -(Pos.x - GameState.Canvas.width / 2);

    if (camOffsetX < -GameState.Canvas.width / 2)
        camOffsetX = -GameState.Canvas.width / 2;

    if (camOffsetX != -(Pos.x - GameState.Canvas.width / 2))
        spriteOffsetX = -camOffsetX;

    // Paramètres de la route (haut = horizon, bas = bord écran)
    const horizonY = GameState.Canvas.height * 0.5;
    const bottomY = GameState.Canvas.height;

    // Centre de la route en haut/bas (tu pourras les décaler pour les virages)
    const cxTop = GameState.Canvas.width / 2, cxBottom = GameState.Canvas.width / 2;

    const roadWidthBottom = GameState.Canvas.width * 2; // largeur de la route en bas (ajuste à ton goût)

    // Demi-largeur de la route en haut/bas (en haut ~ 10px comme ton code, en bas large)
    const roadHalfTop = 10;
    const roadHalfBottom = GameState.Canvas.width * 0.42; // ajuste à ton goût

    // Helpers de lerp
    const lerp = (a, b, t) => a + (b - a) * t;
    const tAtY = (y) => (y - horizonY) / (bottomY - horizonY); // 0..1 du haut vers le bas
    const roadHalfAtY = (y) => lerp(roadHalfTop, roadHalfBottom, tAtY(y));
    const centerXAtY = (y) => lerp(cxTop, cxBottom, tAtY(y));  // utile si tu fais des virages

    // Dessiner le la route jusqu'a l'horizon. Il n'y a pas de sprite, donc on va tous dessiner avec des formes.
    GameState.Context.fillStyle = "gray";
    GameState.Context.beginPath();
    GameState.Context.moveTo(0, GameState.Canvas.height);
    GameState.Context.lineTo(roadWidthBottom, GameState.Canvas.height);
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
        bottomX: GameState.Canvas.width * edgeFrac,  // centre en bas
        centerXAtY,
        roadHalfAtY: roadHalfAtY,
        // proportion de la largeur route dédiée à la ligne
        lineFrac: 0.02,       // ~5% de la demi-largeur (ajuste)
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
        bottomX: GameState.Canvas.width * (2 - edgeFrac),  // centre en bas
        centerXAtY,
        roadHalfAtY: roadHalfAtY,
        // proportion de la largeur route dédiée à la ligne
        lineFrac: 0.02,       // ~5% de la demi-largeur (ajuste)
        dashLenNear: 80,      // longueur d’un tiret près de la caméra
        dashLenFar: 8,        // longueur d’un tiret près de l’horizon
        gapScale: 0.6,        // 0.6 => l’espace fait ~60% de la longueur
        style: { type: 'solid', color: '#e7e7e7' }
        //color: "white"
    });


    // --- Ligne centrale en QUADS perspective ---
    drawDashesByBottomX(GameState.Context, {
        horizonY: horizonY,
        bottomY: bottomY,
        bottomX: GameState.Canvas.width / 3,  // centre en bas
        centerXAtY,
        roadHalfAtY: roadHalfAtY,
        Offset: Pos.Y,
        // proportion de la largeur route dédiée à la ligne
        lineFrac: 0.02,       // ~5% de la demi-largeur (ajuste)
        dashLenNear: 80,      // longueur d’un tiret près de la caméra
        dashLenFar: 8,        // longueur d’un tiret près de l’horizon
        gapScale: 0.6,        // 0.6 => l’espace fait ~60% de la longueur
        //color: "white"
    });

    drawDashesByBottomX(GameState.Context, {
        horizonY: horizonY,
        bottomY: bottomY,
        bottomX: GameState.Canvas.width * 2 / 3,  // centre en bas
        centerXAtY,
        roadHalfAtY: roadHalfAtY,
        Offset: Pos.Y,
        // proportion de la largeur route dédiée à la ligne
        lineFrac: 0.02,       // ~5% de la demi-largeur (ajuste)
        dashLenNear: 80,      // longueur d’un tiret près de la caméra
        dashLenFar: 8,        // longueur d’un tiret près de l’horizon
        gapScale: 0.6,        // 0.6 => l’espace fait ~60% de la longueur
        //color: "white"
    });
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
    TextureIds = [];
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