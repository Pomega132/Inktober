/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Rect} player
 * @param {Array<Rect>} tires
 * @param {Array<Crow>} crows
 */
export function RenderGame(player, tires, crows)
{
    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);

    // Afficher un rectangle blanc pour le joueur.
    GameState.Context.fillStyle = "white";
    GameState.Context.fillRect(player.position.x, player.position.y, player.size.x, player.size.y);

    // Afficher des ronds blancs avec un contour en dégradé bleu clair pour les tires.
    for (var tire of tires)
    {
        GameState.Context.fillStyle = "white";
        GameState.Context.strokeStyle = "lightblue";
        GameState.Context.lineWidth = 5;
        GameState.Context.beginPath();
        GameState.Context.arc(tire.position.x, tire.position.y, tire.size.x / 2, 0, Math.PI * 2);
        GameState.Context.fill();
        GameState.Context.stroke();
    }

    // Afficher les crows.
    for (var crow of crows)
    {
        var textureCat = "";
        switch (crow.etat)
        {
            case E_CROW_STATE.FLY:
                textureCat = "Fly";
                break;
            case E_CROW_STATE.ATTAQUE:
                textureCat = "Attaque";
                break;
            case E_CROW_STATE.GET_DAMAGE:
                textureCat = "GetDamage";
                break;
            case E_CROW_STATE.DEAD:
                textureCat = "Dead";
                break;
        }
        var texture = GameState.Textures.Texture[textureCat][Math.floor(crow.frame) % GameState.Textures.TextureIds[textureCat].length];
        GameState.Context.drawImage(texture, crow.position.x, crow.position.y, crow.size.x, crow.size.y);
    }
}

export class Textures
{
    Texture = {};
    TextureIds = {
        Attaque: [0, 1, 2, 3, 4],
        Dead: [0, 1, 2, 3, 4],
        Fly: [0, 1, 2, 3, 4],
        GetDamage: [0, 1, 2, 3, 4],
    };

    constructor()
    {
        for (var textureCat in this.TextureIds)
        {
            this.Texture[textureCat] = {};

            for (var texture of this.TextureIds[textureCat])
            {
                var img = new Image();
                img.src = `/Images/2025/10/${textureCat}/${texture}.png`;
                this.Texture[textureCat][texture] = img;
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

export class Crow extends Rect
{
    constructor()
    {
        super();
        /** @type {E_CROW_STATE} */
        this.etat = E_CROW_STATE.FLY;
        this.frame = 0;
    }
}

/** @enum {number} */
export const E_CROW_STATE = {
    FLY: 0,
    ATTAQUE: 1,
    GET_DAMAGE: 2,
    DEAD: 3
}

export class Point
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
}