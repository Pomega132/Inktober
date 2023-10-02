"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

function Controller($scope)
{
    var delai = 10;
    var canvas = document.getElementById("Jeu");
    /**@type {Spider} */
    var spiders = [new Spider(80, 80), new Spider(150, 150)];

    spiders[0].Color = "Red";
    spiders[1].Color = "Green";

    this.Init = function ()
    {
        $scope.Cursor = new Point(1000, 400);

        window.requestAnimationFrame(PlaceForme);
    }

    $scope.Mouse = function (ev)
    {

    }

    function PlaceForme()
    {
        var size = 15;
        const time = new Date();

        /**@type {CanvasRenderingContext2D} */
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate($scope.Cursor.X, $scope.Cursor.Y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(-$scope.Cursor.X, -$scope.Cursor.Y);

        for (var spider of spiders)
        {
            spider.Move($scope.Cursor);

            ctx.translate(spider.X, spider.Y);
            //ctx.rotate((Math.PI / 180) * 1);
            ctx.rotate(spider.Rotate);
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 2 / 5, size / 2);
            ctx.lineTo(-(size * 2 / 5), size / 2);
            ctx.fill();

            ctx.rotate(-spider.Rotate);
            ctx.translate(-spider.X, -spider.Y);
        }

        ctx.restore();

        window.requestAnimationFrame(PlaceForme);
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

    /**
     * 
     * @param {Point} curseur
     */
    Move(curseur)
    {
        SetRotation(curseur);


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
        const angleEnDegres = (angleEnRadians * 180) / Math.PI;

        // L'angle calculé est par rapport à l'axe x positif, ajustons-le pour qu'il soit par rapport à l'axe y positif
        const angleFinal = angleEnDegres - 90;

        this.Rotate = angleFinal;
    }
}