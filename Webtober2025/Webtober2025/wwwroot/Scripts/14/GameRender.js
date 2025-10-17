/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame() {
    GameState = new GameStateInfo();
}

export function RenderGame() {
    
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

export class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}