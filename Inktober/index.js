"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

module.filter("day", function ()
{
    return function (input, size)
    {
        var out = String(input);        

        while (out.length < size)
            out = `0${out}`;

        return out;
    };
});

function Controller($scope)
{
    this.Init = function ()
    {
        $scope.Date = new Date();
        $scope.Inktober = Inktober;
    }

    $scope.CheckDate = function (day)
    {
        var date = new Date(2023, 9, day);

        return $scope.Date < date;
    }
}