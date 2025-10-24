/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Rect[]} troncs
 * @param {Point} player
 */
export function RenderGame(troncs, player)
{
    const NB_WATER_LINES = 17;

    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;

    // Dessiner l'arrière-plan. L'arrivée en haut (76px), trois ligne d'eau (38x38px. Texture Tiles 1:0). La cote de départ en bas (38x38px. Texture Tiles 0:1 et 0:2 en alternance). Puis le sol (38x38px. Texture Tiles 0:0).
    for (var x = 0; x < GameState.Canvas.width; x += 76)
    {
        GameState.Context.drawImage(GameState.Textures.GetImage("Arrivee", GameState.FrameCount), x, 0, 76, 76);
        for (var y = 76; y < 76 + (38 * NB_WATER_LINES); y += 38)
        {
            GameState.Context.drawImage(GameState.Textures.Texture["Tiles"], 0, 38, 38, 38, x, y, 38, 38);
            GameState.Context.drawImage(GameState.Textures.Texture["Tiles"], 0, 38, 38, 38, x + 38, y, 38, 38);
        }

        GameState.Context.drawImage(GameState.Textures.Texture["Tiles"], 38, 0, 76, 38, x, 76 + (38 * NB_WATER_LINES), 76, 38);

        GameState.Context.drawImage(GameState.Textures.Texture["Tiles"], 0, 0, 38, 38, x, 76 + (38 * (NB_WATER_LINES + 1)), 38, 38);
        GameState.Context.drawImage(GameState.Textures.Texture["Tiles"], 0, 0, 38, 38, x + 38, 76 + (38 * (NB_WATER_LINES + 1)), 38, 38);
    }

    // Dessiner les troncs.
    for (var tronc of troncs)
    {
        // Dessiner l'eau animée sous le tronc.
        GameState.Context.drawImage(GameState.Textures.GetImage("Onde05", GameState.FrameCount), tronc.position.x-6, tronc.position.y - 3, 51, 36);

        // Dessiner le tronc.
        GameState.Context.drawImage(GameState.Textures.GetImage("Tronc", GameState.FrameCount), tronc.position.x, tronc.position.y, tronc.size.x, tronc.size.y);
    }

    // Dessiner le joueur. (Un carré jaune de 20x20px)
    GameState.Context.fillStyle = "yellow";
    GameState.Context.fillRect(player.x - 10, player.y - 10, 20, 20);

    GameState.FrameCount++;
}

export class Textures
{
    Texture = {};
    TextureIds = {
        Arrivee: 4,
        Onde05: 6,
        Onde1: 6,
        Onde2: 6,
        Tiles: "Tiles",
        Tronc: "Tronc",
    };

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
            var frame = Math.floor(frameCount / 6) % texture.length;
            return texture[frame];
        }
        return texture;
    }

    constructor()
    {
        for (var textureName in this.TextureIds)
        {
            var texture = this.TextureIds[textureName];

            if (typeof texture === "number")
            {
                for (var i = 0; i < texture; i++)
                {
                    var img = new Image();
                    img.src = `/Images/2025/14/${textureName}/${i}.png`;
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
                img.src = `/Images/2025/14/${texture}.png`;
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
        this.FrameCount = 0;

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