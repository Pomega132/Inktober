"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

function Controller($scope)
{
    var main = document.getElementById("Main");
    var poison = document.getElementById("Poison");
    var timeStart = null;
    var gameSpeed = 2;
    var spawnDelay = 2 * 1000;
    var speedUpDelay = 10 * 1000;
    var spawnUpDelay = 20 * 1000;

    $scope.Hamecons = [];
    $scope.Game = false;

    this.Init = function ()
    {
        $scope.StartGame();

        window.requestAnimationFrame(GameLoop);
    }

    $scope.StartGame = function ()
    {
        $scope.Hamecons = [];
        $scope.Game = true;
        timeStart = new Date();
        gameSpeed = 2;

        SpawnHamecon();

        setTimeout(SpeedUp, speedUpDelay);
        setTimeout(SpawnUp, spawnUpDelay);
    }

    $scope.MoveMouse = function (ev)
    {
        if ($scope.Game)
            poison.style.top = `${ev.offsetY - 12}px`;
    }

    /**
     * 
     * @param {Hamecon} hamecon
     */
    $scope.GetHameconStyle = function (hamecon)
    {
        return {
            "transform": `translateY(${hamecon.Hauteur}px)`,
            "left": `${hamecon.Gauche}px`
        }
    }

    function GameLoop()
    {
        if ($scope.Game)
        {
            for (var i = 0; i < $scope.Hamecons.length; i++)
            {
                $scope.Hamecons[i].Gauche -= gameSpeed;

                if ($scope.Hamecons[i].Gauche + 32 < 0)
                    $scope.Hamecons.splice(i, 1);
                else if ($scope.Hamecons[i].ChechColition(poison))
                    StopGame();
            }

            var duree = new Date(new Date() - timeStart);
            $scope.Duree = duree.getMinutes() * 60 + duree.getSeconds() + duree.getMilliseconds() / 1000;
            $scope.$apply();
        }

        window.requestAnimationFrame(GameLoop);
    }

    function StopGame()
    {
        $scope.Game = false;
        var duree = new Date(new Date() - timeStart);

        $scope.Duree = duree.getMinutes() * 60 + duree.getSeconds() + duree.getMilliseconds() / 1000;
    }

    function SpawnHamecon()
    {
        $scope.Hamecons.push(new Hamecon());

        if ($scope.Game)
            setTimeout(SpawnHamecon, spawnDelay);
    }

    function SpeedUp()
    {
        gameSpeed *= 1.5;

        if ($scope.Game)
            setTimeout(SpeedUp, speedUpDelay);
    }

    function SpawnUp()
    {
        spawnDelay *= .5;

        if ($scope.Game)
            setTimeout(SpawnUp, spawnUpDelay);
    }

    class Hamecon
    {
        height = 50;
        Hauteur = Math.floor(Math.random() * (main.clientHeight - this.height) + this.height);
        Gauche = main.clientWidth;

        /**
         * 
         * @param {HTMLImageElement} poison
         */
        ChechColition(poison)
        {
            const width = 25; // Largeur de l'hameçon.

            if (this.Gauche > poison.x + poison.width)
                return false
            if (this.Gauche + width < poison.x)
                return false;
            if (this.Hauteur < poison.offsetTop)
                return false;
            if (this.Hauteur - this.height > poison.offsetTop + poison.height)
                return false;

            return true;
        }
    }
}