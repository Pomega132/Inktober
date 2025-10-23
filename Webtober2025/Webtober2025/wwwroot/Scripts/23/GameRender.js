/** @type {GameStateInfo} */
export var GameState = GameState || {};

export function InitGame()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {Point} mousePosition
 */
export function RenderGame(mousePosition, wallsPoints)
{
    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);    

    // Dessiner un point jaune pale à la position de la souris.
    GameState.Context.fillStyle = "rgba(255, 255, 150, 0.8)";
    GameState.Context.beginPath();
    GameState.Context.arc(mousePosition.x, mousePosition.y, 10, 0, Math.PI * 2);
    GameState.Context.fill();

    // Dessiner un dégrader jaune pale vers transparent pour faire un effet de lumière.
    var gradient = GameState.Context.createRadialGradient(mousePosition.x, mousePosition.y, 0, mousePosition.x, mousePosition.y, 50);
    gradient.addColorStop(0, "rgba(255, 255, 150, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 150, 0)");
    GameState.Context.fillStyle = gradient;
    // Créer une forme à partir des points des murs.
    GameState.Context.beginPath();
    GameState.Context.moveTo(wallsPoints[0].x, wallsPoints[0].y);
    for (var i = 1; i < wallsPoints.length; i++)
    {
        GameState.Context.lineTo(wallsPoints[i].x, wallsPoints[i].y);
    }
    GameState.Context.closePath();
    GameState.Context.fill();

    //GameState.Context.fillRect(mousePosition.x - 30, mousePosition.y - 30, 60, 60);

}

export function ShowLabirinthe(cellsJson)
{
    var cells = JSON.parse(cellsJson);
    const cellSize = 50;

    // Effacer le canvas.
    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);    

    for (var ligne of cells)
    {
        for (var cell of ligne)
        {
            var x = cell.Coordinates.X * cellSize;
            var y = cell.Coordinates.Y * cellSize;
            // Écrire l'ID de la cellule au centre de la cellule.
            GameState.Context.fillStyle = "black";
            GameState.Context.font = "12px Arial";
            GameState.Context.textAlign = "center";
            GameState.Context.fillText(cell.Id, x + cellSize / 2, y + cellSize / 2);

            // Dessiner les murs. (Un trait de 5 pixels d'épaisseur)
                GameState.Context.lineWidth = 5;
                GameState.Context.strokeStyle = "black";
            if (cell.Walls[0])
            {
                GameState.Context.beginPath();
                GameState.Context.moveTo(x, y);
                GameState.Context.lineTo(x + cellSize, y);
                GameState.Context.stroke();
            }
            if (cell.Walls[1])
            {
                GameState.Context.beginPath();
                GameState.Context.moveTo(x + cellSize, y);
                GameState.Context.lineTo(x + cellSize, y + cellSize);
                GameState.Context.stroke();
            }
            if (cell.Walls[2])
            {
                GameState.Context.beginPath();
                GameState.Context.moveTo(x, y + cellSize);
                GameState.Context.lineTo(x + cellSize, y + cellSize);
                GameState.Context.stroke();
            }
            if (cell.Walls[3])
            {
                GameState.Context.beginPath();
                GameState.Context.moveTo(x, y);
                GameState.Context.lineTo(x, y + cellSize);
                GameState.Context.stroke();
            }
        }
    }
}

export class Textures
{
    Texture = {};
    TextureIds = [];

    constructor()
    {
        for (var texture of this.TextureIds)
        {
            var img = new Image();
            img.src = `/Images/2025/23/${texture}.png`;
            this.Texture[texture] = img;
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