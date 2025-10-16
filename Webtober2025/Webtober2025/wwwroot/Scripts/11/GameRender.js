/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame() {
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Rect} player
 * @param {Array<Rect>} tires
 * @param {Array<Bee>} bees
 */
export function RenderGame(player, tires, bees) {
    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;

    // Afficher un petit rond rouge pour le joueur.
    GameState.Context.fillStyle = "red";
    GameState.Context.beginPath();
    GameState.Context.arc(player.position.x + player.size.x / 2, player.position.y + player.size.y / 2, player.size.x / 2, 0, Math.PI * 2);
    GameState.Context.fill();

    // Afficher les abeilles.
    for (var bee of bees) {
        var textureId = "Bee/" + bee.frame;
        if (bee.toLeft) {
            GameState.Context.save();
            GameState.Context.scale(-1, 1);
            GameState.Context.drawImage(GameState.Textures.Texture[textureId], -bee.position.x - bee.size.x, bee.position.y, bee.size.x, bee.size.y);
            GameState.Context.restore();
        } else {
            GameState.Context.drawImage(GameState.Textures.Texture[textureId], bee.position.x, bee.position.y, bee.size.x, bee.size.y);
        }
    }

    // Afficher les tires avec la rotation au center.
    for (var tire of tires) {
        GameState.Context.save();
        GameState.Context.translate(tire.position.x + tire.size.x / 2, tire.position.y + tire.size.y / 2);
        GameState.Context.rotate(tire.rotation);
        GameState.Context.drawImage(GameState.Textures.Texture["Pique"], -tire.size.x / 2, -tire.size.y / 2, tire.size.x, tire.size.y);
        GameState.Context.restore();
    }
}

export class Textures {
    Texture = {};
    TextureIds = [
        "Bee/0",
        "Bee/1",
        "Pique"
    ];

    constructor() {
        for (var texture of this.TextureIds) {
            var img = new Image();
            img.src = `/Images/2025/11/${texture}.png`;
            this.Texture[texture] = img;
        }
    }
}

export class GameStateInfo {

    constructor() {
        /** @type {HTMLCanvasElement} */
        this.Canvas = document.getElementById("game");
        this.Context = this.Canvas.getContext("2d");
        this.Textures = new Textures();
    }
}

export class Rect {
    constructor() {
        this.position = new Point(0, 0);
        this.size = new Point(100, 100);
    }
}

export class Bee extends Rect {
    constructor() {
        super();
        this.toLeft = false;
        this.frame = 0;
    }
}

export class Tire extends Rect {
    constructor() {
        super();
        this.rotation = 0;
    }
}

export class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}