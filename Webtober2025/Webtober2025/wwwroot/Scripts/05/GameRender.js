/** @type {GameStateInfo} */
var GameState = GameState || {};

window.InitGame = function ()
{
    GameState = new GameStateInfo();
}

/**
 * 
 * @param {any} player
 * @param {Array<Array<number>>} map
 */
window.GameRender = function (player, map)
{
    GameState.Player = player;

    GameState.Context.clearRect(0, 0, GameState.Canvas.width, GameState.Canvas.height);
    GameState.Context.imageSmoothingEnabled = false;
    // Draw background
    GameState.Context.drawImage(GameState.BgImage, 0, 0, GameState.Canvas.width, GameState.Canvas.height);

    // Ligne du sol à 700px
    //GameState.Context.beginPath();
    //GameState.Context.moveTo(0, 700);
    //GameState.Context.lineTo(GameState.Canvas.width, 700);
    //GameState.Context.strokeStyle = 'brown';
    //GameState.Context.lineWidth = 5;
    //GameState.Context.stroke();
    //GameState.Context.closePath();

    for (var i = 0; i < map.length; i++)
    {
        for (var j = 0; j < map[i].length; j++)
        {

            // Grass
            if (map[i][j] == 0 && i + 1 < map.length && (map[i + 1][j] & 1) == 1)
            {
                GameState.Context.drawImage(GameState.Terrain.TextureImage,
                    GameState.Terrain.Grass.x * GameState.Terrain.TileSize, GameState.Terrain.Grass.y * GameState.Terrain.TileSize,
                    GameState.Terrain.TileSize, GameState.Terrain.TileSize,
                    j * GameState.Terrain.TileSize, i * GameState.Terrain.TileSize, GameState.Terrain.TileSize, GameState.Terrain.TileSize);
            }
            // Ground
            else if (map[i][j] == 1)
            {
                if (i > 0 && map[i - 1][j] != 1)
                {

                    GameState.Context.drawImage(GameState.Terrain.TextureImage,
                        GameState.Terrain.Ground.x * GameState.Terrain.TileSize, GameState.Terrain.Ground.y * GameState.Terrain.TileSize,
                        GameState.Terrain.TileSize, GameState.Terrain.TileSize,
                        j * GameState.Terrain.TileSize, i * GameState.Terrain.TileSize, GameState.Terrain.TileSize, GameState.Terrain.TileSize);
                }
                else
                {
                    // Underground
                    GameState.Context.drawImage(GameState.Terrain.TextureImage,
                        GameState.Terrain.Underground.x * GameState.Terrain.TileSize, GameState.Terrain.Underground.y * GameState.Terrain.TileSize,
                        GameState.Terrain.TileSize, GameState.Terrain.TileSize,
                        j * GameState.Terrain.TileSize, i * GameState.Terrain.TileSize, GameState.Terrain.TileSize, GameState.Terrain.TileSize);
                }
            }
            // Platform
            else if (map[i][j] == 3)
            {
                GameState.Context.drawImage(GameState.Terrain.TextureImage,
                    GameState.Terrain.Platform.x * GameState.Terrain.TileSize, GameState.Terrain.Platform.y * GameState.Terrain.TileSize,
                    GameState.Terrain.TileSize, GameState.Terrain.TileSize,
                    j * GameState.Terrain.TileSize, i * GameState.Terrain.TileSize, GameState.Terrain.TileSize, GameState.Terrain.TileSize);
            }
            // Chest
            else if (map[i][j] == 4)
            {
                GameState.Context.drawImage(GameState.Terrain.TextureImage,
                    GameState.Terrain.Chest.x * GameState.Terrain.TileSize, GameState.Terrain.Chest.y * GameState.Terrain.TileSize,
                    GameState.Terrain.TileSize, GameState.Terrain.TileSize,
                    j * GameState.Terrain.TileSize, i * GameState.Terrain.TileSize, GameState.Terrain.TileSize, GameState.Terrain.TileSize);
            }
        }
    }

    GameState.Context.save();

    // Set sprite
    var spritePos = { x: 0, y: 0 };
    var contextTransform = { translateX: GameState.Player.x + 16, translateY: GameState.Player.y + 16, rotate: 0 };

    if (GameState.Player.hasInAir)
    {
        if (GameState.Player.vy < 0)
        {
            // Going up
            spritePos = { x: 0, y: 2 };
            if (GameState.Player.toLeft)
                contextTransform.rotate = 35 * Math.PI / 180;
            else
                contextTransform.rotate = -35 * Math.PI / 180;
        }
        else
        {
            // Going down
            spritePos = { x: 1, y: 2 };
            if (GameState.Player.toLeft)
                contextTransform.rotate = -35 * Math.PI / 180;
            else
                contextTransform.rotate = 35 * Math.PI / 180;
        }
    }
    else if (GameState.LastPlayerState)
    {
        if ((GameState.LastPlayerState.vx == 0 && GameState.Player.vx != 0) || (GameState.LastPlayerState.vx != 0 && GameState.Player.vx == 0)) // Change animation
        {
            GameState.LastCall = new Date();
            GameState.SpritePos = 0;
        }
        else if ((new Date() - GameState.LastCall) > GameState.SpriteDuration)
        {
            GameState.LastCall = new Date();
            GameState.SpritePos = (GameState.SpritePos + 1) % 5;
        }
        if (GameState.Player.vx == 0) // Idle
        {
            GameState.SpriteDuration = GameState.IdleSpriteDuration;
            if (GameState.Player.broute) // Eating
                spritePos.y = 1;
            else
                spritePos.y = 0;
        }
        else // Walking
        {
            GameState.SpriteDuration = GameState.WalkSpriteDuration;
            spritePos.y = 2;
        }

        spritePos.x = GameState.SpritePos;
    }


    //// Draw player
    GameState.Context.translate(contextTransform.translateX, contextTransform.translateY);
    GameState.Context.rotate(contextTransform.rotate);
    if (GameState.Player.toLeft)
        GameState.Context.scale(-1, 1);
    GameState.Context.drawImage(GameState.DeerImage, spritePos.x * 32, spritePos.y * 32, 32, 32, -16, -16, 64, 64);
    GameState.Context.restore();
    //context.fillStyle = 'blue';
    //context.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    //// Draw obstacles
    //context.fillStyle = 'red';
    //gameState.obstacles.forEach(obstacle => {
    //    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    //});
    //// Draw score
    //context.fillStyle = 'black';
    //context.font = '20px Arial';
    //context.fillText('Score: ' + gameState.score, 10, 30);

    GameState.LastPlayerState = JSON.parse(JSON.stringify(GameState.Player));
}

class Terrain
{
    Texture = "/Images/2025/05/tilesetOpenGame.png";
    TileSize = 32;
    Grass = { x: 3, y: 3 };
    Ground = { x: 3, y: 4 };
    Underground = { x: 3, y: 5 };
    Platform = { x: 5, y: 3 };
    Chest = { x: 1, y: 3 };
    TextureImage = new Image();

    constructor()
    {
        this.TextureImage.src = this.Texture;
    }
}

class GameStateInfo
{
    Bg = "/Images/2025/05/Forest Pass/bgcolor.png"
    DeerSrc = "/Images/2025/05/deer male calciumtrice.png";
    WalkSpriteDuration = 100; // ms
    IdleSpriteDuration = 800; // ms

    constructor()
    {
        /** @type {HTMLCanvasElement} */
        this.Canvas = document.getElementById("game");
        this.Context = this.Canvas.getContext("2d");
        this.BgImage = new Image();
        this.BgImage.src = this.Bg;
        this.DeerImage = new Image();
        this.DeerImage.src = this.DeerSrc;
        this.SpritePos = 0;
        this.LastCall = new Date();
        this.Player = null;
        this.SpriteDuration = 100; // ms
        this.LastPlayerState = null;
        this.Terrain = new Terrain();
    }
}
