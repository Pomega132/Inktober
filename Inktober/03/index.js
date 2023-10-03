"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

module.filter("zero", function ()
{
    return function (input, size)
    {
        input = String(input) || "";
        for (var i = input.length; i < size; i++)
        {
            input = `0${input}`;
        }

        return input;
    };
});

module.directive('ngRightClick', function ($parse)
{
    return function (scope, element, attrs)
    {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event)
        {
            scope.$apply(function ()
            {
                event.preventDefault();
                fn(scope, { $event: event });
            });
        });
    };
});

function Controller($scope)
{
    $scope.Large = 16;
    $scope.Haut = 16;
    $scope.Start = { X: 0, Y: 0 };
    $scope.End = { X: $scope.Large - 1, Y: $scope.Haut - 1 };
    $scope.Delay = 10;

    $scope.Instantane = false;
    $scope.Isole = false;
    $scope.Grille = [];

    this.Init = function ()
    {
        $scope.$watchGroup(["Large", "Haut"], function (newValue)
        {
            if (newValue[0] > 32)
                $scope.Large = 32;

            if (newValue[0] < 5)
                $scope.Large = 5;

            if (newValue[1] > 32)
                $scope.Haut = 32;

            if (newValue[1] < 5)
                $scope.Haut = 5;
        });

        $scope.Generate();
    }

    $scope.Generate = function ()
    {
        $scope.Grille = [];

        $scope.Start.Zone = $scope.Start.Y * $scope.Large + $scope.Start.X;
        $scope.End.Zone = $scope.End.Y * $scope.Large + $scope.End.X;

        for (var y = 0; y < $scope.Haut; y++)
        {
            $scope.Grille.push([]);
            for (var x = 0; x < $scope.Large; x++)
            {
                $scope.Grille[y].push(new Case(x, y, $scope.Large * y + x, $scope.Start.Zone, $scope.End.Zone));
            }
        }

        TracePath();
    }

    $scope.SetStart = function (c)
    {
        $scope.Start = angular.copy(c);
    }

    $scope.SetEnd = function (c)
    {
        $scope.End = angular.copy(c);
    }

    /**
     * 
     * @param {Case} c
     * @returns {boolean}
     */
    $scope.CheckIsole = function (c)
    {
        if (!$scope.Isole)
            return true;

        return c.Zone == $scope.Start.Zone || c.Zone == $scope.End.Zone;
    }

    function TracePath()
    {
        var x1 = Math.floor(Math.random() * $scope.Large);
        var y1 = Math.floor(Math.random() * $scope.Haut);
        var direction = Math.floor(Math.random() * 4);

        /**@type {Case} */
        var case1 = $scope.Grille[y1][x1];

        switch (direction)
        {
            case 0:
                if (y1 > 0)
                    case1.Join($scope.Grille[y1 - 1][x1], $scope.Grille);
                break;
            case 1:
                if (x1 < $scope.Large - 1)
                    case1.Join($scope.Grille[y1][x1 + 1], $scope.Grille);
                break;
            case 2:
                if (y1 < $scope.Haut - 1)
                    case1.Join($scope.Grille[y1 + 1][x1], $scope.Grille);
                break;
            case 3:
                if (x1 > 0)
                    case1.Join($scope.Grille[y1][x1 - 1], $scope.Grille);
                break;
        }

        if (CheckEnd())
            return;

        if ($scope.Instantane)
            TracePath();
        else
            setTimeout(() =>
            {
                TracePath();
                $scope.$apply();
            }, $scope.Delay);
    }

    function CheckEnd()
    {
        var startZone, endZone;

        for (var y = 0; y < $scope.Grille.length; y++)
        {
            for (var x = 0; x < $scope.Grille[y].length; x++)
            {
                if ($scope.Grille[y][x].IsStart)
                    $scope.Start.Zone = $scope.Grille[y][x].Zone;

                if ($scope.Grille[y][x].IsEnd)
                    $scope.End.Zone = $scope.Grille[y][x].Zone;
            }
        }

        return $scope.Start.Zone == $scope.End.Zone;
    }
}

class Case
{
    X = 0;
    Y = 0;
    Fond = Math.floor(Math.random() * 12);
    Path = 0;
    Zone = 0;
    IsStart = false;
    IsEnd = false;

    constructor(x, y, zone, zoneStart, zoneEnd)
    {
        this.X = x;
        this.Y = y;
        this.Zone = zone;
        this.IsStart = zone == zoneStart;
        this.IsEnd = zone == zoneEnd;
    }

    /**
     * @param {Case} autreCase
     */
    Join(autreCase, cases)
    {
        if (!autreCase)
            return;

        if (this.Zone == autreCase.Zone)
            return;

        if ((this.IsStart && this.Path != 0x00) || (autreCase.IsStart && autreCase.Path != 0x00)) // Le début n'a le droit qu'à un seul chemin.
            return;

        if ((this.IsEnd && this.Path != 0x00) || (autreCase.IsEnd && autreCase.Path != 0x00)) // La fin n'a le droit qu'à un seul chemin.
            return;

        if (this.X == autreCase.X) // Sur la même ligne.
        {
            if (this.Y == autreCase.Y + 1) // autreCase est au dessus.
            {
                this.Path |= 0x01;
                autreCase.Path |= 0x04;
                this.JoinZone(autreCase, cases);
            }
            else if (this.Y == autreCase.Y - 1) // autreCase est en dessous.
            {
                this.Path |= 0x04;
                autreCase.Path |= 0x01;
                this.JoinZone(autreCase, cases);
            }
        }
        else if (this.Y == autreCase.Y) // Sur la même colonne.
        {

            if (this.X == autreCase.X + 1) // autreCase est à gauche.
            {
                this.Path |= 0x08;
                autreCase.Path |= 0x02;
                this.JoinZone(autreCase, cases);
            }
            else if (this.X == autreCase.X - 1) // autreCase est à droite.
            {
                this.Path |= 0x02;
                autreCase.Path |= 0x08;
                this.JoinZone(autreCase, cases);
            }
        }
    }

    /**
     * 
     * @param {Case} autreCase
     * @param {Case[][]} cases 
     */
    JoinZone(autreCase, cases)
    {
        var zone = null;

        if (this.Zone < autreCase.Zone) // Appliqué la zone de la case en cours.
            zone = {
                Search: angular.copy(autreCase.Zone),
                Apply: this.Zone
            };
        else if (this.Zone > autreCase.Zone) // Appliqué la zone de l'autre case.
            zone = {
                Search: angular.copy(this.Zone),
                Apply: autreCase.Zone
            };

        if (!zone)
            return;

        for (var y = 0; y < cases.length; y++)
        {
            for (var x = 0; x < cases[y].length; x++)
            {
                if (cases[y][x].Zone == zone.Search)
                    cases[y][x].Zone = zone.Apply;
            }
        }
    }
}