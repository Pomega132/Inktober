/** @type {GameStateInfo} */
var GameState = GameState || {};

window.InitGame = function ()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Array<Array<Array<number>>>} map
 * @param {Breaking} breaking
 */
window.RenderGame = function (map, breaking)
{
    function hash2(x, y)
    {
        // on force les entiers sur 32 bits non signés
        let ux = x >>> 0;
        let uy = y >>> 0;

        ux = Math.imul(ux, 0x9e3779b1); // multiplication mod 2^32
        uy ^= (ux << 16) | (ux >>> 16);
        uy = Math.imul(uy, 0x85ebca6b);
        ux ^= (uy << 13) | (uy >>> 19);

        return (ux ^ uy) >>> 0; // résultat sur 32 bits
    }

    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;

    const TILE = 64;
    const SHADOW_SIZE = 24;

    // ★ OMBRE — tableau des “couches d’air au-dessus” (compte par (x,y))
    const height = map[0].length;
    const width = map[0][0].length;
    const airAbove = new Uint16Array(width * height); // auto-initialisé à 0

    // ★ paramétrage de l’ombre
    const alphaPerLayer = 0.06;       // opacité ajoutée par couche d’air
    const alphaMax = 0.35;       // plafond d’opacité pour rester soft

    // Afficher les textures qui ne sont pas de l'air, de la couche la plus basse à la plus haute.
    for (var z = map.length - 1; z > -1; z--)
    {
        for (var y = 0; y < map[z].length; y++)
        {
            for (var x = 0; x < map[z][y].length; x++)
            {
                var blockId = map[z][y][x];

                if (blockId == 0) // Est de l'air
                {
                    if (y > 0 && map[z][y - 1][x] != 0) // Si il y à un bloc au dessus
                    {
                        // Créé un dégradé noir opaque -> noir transparent vers le bas de SHADOW_SIZE pixels.
                        var gradient = GameState.Context.createLinearGradient(x * TILE, y * TILE, x * TILE, y * TILE + SHADOW_SIZE);
                        gradient.addColorStop(0, "rgba(0,0,0,1)");
                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE, y * TILE, TILE, SHADOW_SIZE);
                    }

                    if (y < height - 1 && map[z][y + 1][x] != 0) // Si il y à un bloc en dessous
                    {
                        // Créé un dégradé noir opaque -> noir transparent vers le haut de SHADOW_SIZE pixels.
                        var gradient = GameState.Context.createLinearGradient(x * TILE, y * TILE + TILE - SHADOW_SIZE, x * TILE, y * TILE + TILE);
                        gradient.addColorStop(0, "rgba(0,0,0,0)");
                        gradient.addColorStop(1, "rgba(0,0,0,1)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE, y * TILE + TILE - SHADOW_SIZE, TILE, SHADOW_SIZE);
                    }

                    if (x > 0 && map[z][y][x - 1] != 0) // Si il y à un bloc à gauche
                    {
                        // Créé un dégradé noir opaque -> noir transparent vers la gauche de SHADOW_SIZE pixels.
                        var gradient = GameState.Context.createLinearGradient(x * TILE, y * TILE, x * TILE + SHADOW_SIZE, y * TILE);
                        gradient.addColorStop(0, "rgba(0,0,0,1)");
                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE, y * TILE, SHADOW_SIZE, TILE);
                    }

                    if (x < width - 1 && map[z][y][x + 1] != 0) // Si il y à un bloc à droite
                    {
                        // Créé un dégradé noir opaque -> noir transparent vers la droite de SHADOW_SIZE pixels.
                        var gradient = GameState.Context.createLinearGradient(x * TILE + TILE - SHADOW_SIZE, y * TILE, x * TILE + TILE, y * TILE);
                        gradient.addColorStop(0, "rgba(0,0,0,0)");
                        gradient.addColorStop(1, "rgba(0,0,0,1)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE + TILE - SHADOW_SIZE, y * TILE, SHADOW_SIZE, TILE);
                    }

                    // Les angles
                    if (x > 0 && y > 0 && map[z][y - 1][x] == 0 && map[z][y][x - 1] == 0 && map[z][y - 1][x - 1] != 0) // Si il y à un bloc en haut à gauche et pas en haut ni à gauche.
                    {
                        var gradient = GameState.Context.createRadialGradient(x * TILE, y * TILE, 0, x * TILE, y * TILE, SHADOW_SIZE);
                        gradient.addColorStop(0, "rgba(0,0,0,1)");
                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE, y * TILE, SHADOW_SIZE, SHADOW_SIZE);
                    }

                    if (x < width - 1 && y > 0 && map[z][y - 1][x] == 0 && map[z][y][x + 1] == 0 && map[z][y - 1][x + 1] != 0) // Si il y à un bloc en haut à droite et pas en haut ni à droite.
                    {
                        var gradient = GameState.Context.createRadialGradient(x * TILE + TILE, y * TILE, 0, x * TILE + TILE, y * TILE, SHADOW_SIZE);
                        gradient.addColorStop(0, "rgba(0,0,0,1)");
                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE + TILE - SHADOW_SIZE, y * TILE, SHADOW_SIZE, SHADOW_SIZE);
                    }

                    if (x > 0 && y < height - 1 && map[z][y + 1][x] == 0 && map[z][y][x - 1] == 0 && map[z][y + 1][x - 1] != 0) // Si il y à un bloc en bas à gauche et pas en bas ni à gauche.
                    {
                        var gradient = GameState.Context.createRadialGradient(x * TILE, y * TILE + TILE, 0, x * TILE, y * TILE + TILE, SHADOW_SIZE);
                        gradient.addColorStop(0, "rgba(0,0,0,1)");
                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE, y * TILE + TILE - SHADOW_SIZE, SHADOW_SIZE, SHADOW_SIZE);
                    }

                    if (x < width - 1 && y < height - 1 && map[z][y + 1][x] == 0 && map[z][y][x + 1] == 0 && map[z][y + 1][x + 1] != 0) // Si il y à un bloc en bas à droite et pas en bas ni à droite.
                    {
                        var gradient = GameState.Context.createRadialGradient(x * TILE + TILE, y * TILE + TILE, 0, x * TILE + TILE, y * TILE + TILE, SHADOW_SIZE);
                        gradient.addColorStop(0, "rgba(0,0,0,1)");
                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                        GameState.Context.fillStyle = gradient;
                        GameState.Context.fillRect(x * TILE + TILE - SHADOW_SIZE, y * TILE + TILE - SHADOW_SIZE, SHADOW_SIZE, SHADOW_SIZE);
                    }
                }
                else // N'est pas de l'air
                {
                    // S'il s'agit d'un bloc de stone (1) ou de deepslate (2), ajouter une rotation en fonction de la position.
                    if (blockId == 1 || blockId == 2)
                    {
                        GameState.Context.save();
                        GameState.Context.translate(x * 64 + 32, y * 64 + 32);
                        GameState.Context.rotate((hash2(x, y) % 2) * Math.PI);
                        GameState.Context.translate(-32, -32);
                        GameState.Context.drawImage(GameState.Textures.Texture[blockId],
                            0, 0,
                            GameState.Textures.Texture[blockId].width, GameState.Textures.Texture[blockId].height,
                            0, 0, 64, 64);
                        GameState.Context.restore();
                    }
                    else
                    {
                        GameState.Context.drawImage(GameState.Textures.Texture[blockId],
                            0, 0,
                            GameState.Textures.Texture[blockId].width, GameState.Textures.Texture[blockId].height,
                            x * 64, y * 64, 64, 64);
                    }

                    // Si le bloc est en train d'être cassé, afficher la texture de cassure par dessus.
                    if (breaking?.position.x == x && breaking?.position.y == y && breaking?.couche == z)
                    {
                        var destroyTexture = GameState.Textures.Texture[breaking.destroyTexture];
                        GameState.Context.drawImage(destroyTexture,
                            0, 0,
                            destroyTexture.width, destroyTexture.height,
                            x * 64, y * 64, 64, 64);
                    }
                }
            }
        }
    }
}

class Textures
{
    Texture = {};
    TextureIds = [
        1, 2, 5, 9, 10, 17, 18, 33, 34, 65, 66, 129, 130,
        "Coal", "Raw_Iron", "Iron_Ingot", "Raw_Gold", "Gold_Ingot", "Diamond", "Redstone_Dust", "Lapis_Lazuli",
        "Wooden_Pickaxe", "Stone_Pickaxe", "Iron_Pickaxe", "Golden_Pickaxe", "Diamond_Pickaxe",
        "destroy_stage_0", "destroy_stage_1", "destroy_stage_2", "destroy_stage_3", "destroy_stage_4", "destroy_stage_5", "destroy_stage_6", "destroy_stage_7", "destroy_stage_8", "destroy_stage_9",];

    constructor()
    {
        for (var t of this.TextureIds)
        {
            var img = new Image();
            img.src = `/Images/2025/06/${t}.png`;
            this.Texture[t] = img;
        }
    }
}

class GameStateInfo
{

    constructor()
    {
        /** @type {HTMLCanvasElement} */
        this.Canvas = document.getElementById("game");
        this.Context = this.Canvas.getContext("2d");
        this.Textures = new Textures();
    }
}

class Breaking
{
    constructor()
    {
        this.progress = 0;
        this.destroyTexture = "";
        this.position = new Point();
        this.couche = 0;
    }
}

class Point
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
}