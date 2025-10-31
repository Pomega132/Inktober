/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame()
{
    GameState = new GameStateInfo();
}

/**
 * 
 */
export function RenderGame()
{
    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;
}

export class Textures
{
    Texture = {};
    TextureIds = {
        Arbre1: "Arbre1",
        Arbre2: "Arbre2",
        Arbre3: "Arbre3",
        Arbre4: "Arbre4",
        ArbreMort1: "ArbreMort1",
        ArbreMort2: "ArbreMort2",
        DecoCotes: "DecoCotes",
        DecoCrane: "DecoCrane",
        DecoMaron: "DecoMaron",
        DecoPierre1: "DecoPierre1",
        DecoPierre2: "DecoPierre2",
        DecoPourpre1: "DecoPourpre1",
        DecoPourpre2: "DecoPourpre2",
        Lave: "Lave",
        ObstacleLave: "ObstacleLave",
        ObstacleMaron1: "ObstacleMaron1",
        ObstacleMaron2: "ObstacleMaron2",
        ObstaclePourpre: "ObstaclePourpre",
        ObstaclePourpreChaud1: "ObstaclePourpreChaud1",
        ObstaclePourpreChaud2: "ObstaclePourpreChaud2",
        Sable: "Sable",
        SolGris: "SolGris",
        SolLave: "SolLave",
        SolMaron: "SolMaron",
        SolPourpre: "SolPourpre",
        SolPourpreChaud: "SolPourpreChaud",
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