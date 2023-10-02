"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

/**
 * 
 * @param {angular.IScope} $scope
 */
function Controller($scope)
{
    var delai = 10;
    var canvas = document.getElementById("Jeu");
    /**@type {Spider} */
    var spiders = [];
    var timeStart = null;

    this.Init = function ()
    {
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        $scope.Cursor = new Point(window.innerWidth / 2, window.innerHeight / 2);
        $scope.Game = false;

        $scope.StartGame();

        window.requestAnimationFrame(GameLoop);
    }

    $scope.Mouse = function (ev)
    {
        $scope.Cursor.X = ev.offsetX;
        $scope.Cursor.Y = ev.offsetY;
    }

    $scope.StartGame = function ()
    {
        spiders = [];
        $scope.Game = true;
        timeStart = new Date();

        for (var i = 0; i < 20; i++)
        {
            AddSpider(false);
        }

        AddSpider();
    }

    function GameLoop()
    {
        if ($scope.Game)
        {
            var size = 15;
            var duree = new Date(new Date() - timeStart);
            $scope.$apply(() => $scope.Duree = duree.getMinutes() * 60 + duree.getSeconds() + duree.getMilliseconds() / 1000);

            var timer = duree.getMinutes() * 60 + duree.getSeconds() + duree.getMilliseconds() / 1000;

            /**@type {CanvasRenderingContext2D} */
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            ctx.translate($scope.Cursor.X, $scope.Cursor.Y);

            if (duree.getMinutes() > 0)
                ctx.fillStyle = "red";
            else
                ctx.fillStyle = "black";

            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.translate(-$scope.Cursor.X, -$scope.Cursor.Y);

            for (var spider of spiders)
            {
                spider.Move($scope.Cursor);

                if (spider.Speed == 2)
                    ctx.fillStyle = "black";
                else
                    ctx.fillStyle = "red";

                ctx.translate(spider.X, spider.Y);
                //ctx.rotate((Math.PI / 180) * 1);
                ctx.rotate(spider.Rotate);

                ctx.drawImage(spider.GatImage(), -(25 / 2), -(27 / 2), 25, 27);
                //ctx.beginPath();
                //ctx.moveTo(0, -size);
                //ctx.lineTo(size * 2 / 5, size / 2);
                //ctx.lineTo(-(size * 2 / 5), size / 2);
                //ctx.fill();

                ctx.rotate(-spider.Rotate);
                ctx.translate(-spider.X, -spider.Y);
            }


        }

        //ctx.restore();

        window.requestAnimationFrame(GameLoop);
    }

    function StopGame()
    {
        $scope.Game = false;
        var duree = new Date(new Date() - timeStart);

        $scope.Duree = duree.getMinutes() * 60 + duree.getSeconds() + duree.getMilliseconds() / 1000;
    }

    function AddSpider(timer = true)
    {
        if ($scope.Game)
        {
            var screenSize = new Point(canvas.width, canvas.height);
            var duree = new Date(new Date() - timeStart);

            spiders.push(new Spider(screenSize, duree.getMinutes() > 0, StopGame));

            if (timer)
                setTimeout(AddSpider, delai * 10);
        }
    }
}

class Point
{
    X = 0;
    Y = 0;

    constructor(x, y)
    {
        this.X = x;
        this.Y = y;
    }
}

class Spider extends Point
{
    Rotate = 0;
    Speed = 2;
    Toucher = null;
    SpiderBlack = new Image();
    SpiderRed = new Image();

    /**
     * 
     * @param {Point} screenSize
     */
    constructor(screenSize, speedUp, toucherCallback)
    {
        var pos = Math.random() * 2 * Math.PI;

        var x = Math.cos(pos - (Math.PI / 2)) * screenSize.X * 3 / 4 + screenSize.X / 2;
        var y = Math.sin(pos - (Math.PI / 2)) * screenSize.Y * 3 / 4 + screenSize.Y / 2;

        super(x, y);

        this.Toucher = toucherCallback;

        this.SpiderBlack.src = "Images/Spider_One.png";
        this.SpiderRed.src = "Images/SpiderRed.png";

        if (speedUp)
            this.Speed *= 2;
        else
            setTimeout(() => this.Speed *= 2, 10000);
    }

    GatImage()
    {
        if (this.Speed == 2)
            return this.SpiderBlack;
        else
            return this.SpiderRed;
    }

    /**
     * 
     * @param {Point} curseur
     */
    Move(curseur)
    {
        this.SetRotation(curseur);

        var distance = Math.sqrt(Math.pow(curseur.X - this.X, 2) + Math.pow(curseur.Y - this.Y, 2));

        if (distance < this.Speed)
            this.Toucher();

        var deltaX = Math.cos(this.Rotate + (Math.PI / 2)) * this.Speed;
        var deltaY = Math.sin(this.Rotate + (Math.PI / 2)) * this.Speed;

        this.X += deltaX;
        this.Y += deltaY;
    }

    /**
     * 
     * @param {Point} curseur
     */
    SetRotation(curseur)
    {
        // Calcul des différences en x et y
        const deltaX = curseur.X - this.X;
        const deltaY = curseur.Y - this.Y;

        // Calcul de l'angle en radians en utilisant la fonction atan2
        const angleEnRadians = Math.atan2(deltaY, deltaX);

        // Conversion de l'angle en radians en degrés
        //const angleEnDegres = (angleEnRadians * 180) / Math.PI;

        // L'angle calculé est par rapport à l'axe x positif, ajustons-le pour qu'il soit par rapport à l'axe y positif
        const angleFinal = angleEnRadians - (Math.PI / 2);

        this.Rotate = angleFinal;
    }

    getRandomInt(max)
    {
        return Math.floor(Math.random() * max);
    }
}