"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

module.directive('scroll', ["$parse", function ($parse)
{
    return {
        link: function (scope, elem, attrs)
        {
            var fn = $parse(attrs["scroll"]);

            elem.on('scroll', function (e)
            {
                var o = elem;

                var callback = function ()
                {
                    elem[0].style.overflow = "hidden";
                    fn(scope);
                    elem[0].style.overflow = "";
                };

                if (!scope.$root.$$phase)
                {
                    scope.$apply(callback);
                }
            });
        }
    }
}]);

module.directive('visible', [function ()
{
    return {
        link: function (scope, elem, attrs)
        {
            scope.$watch(attrs["visible"], function (value)
            {
                elem[0].style.visibility = value ? "visible" : "hidden";
            });
        }
    }
}]);

/**
 * 
 * @param {angular.IScope} $scope
 */
function Controller($scope, $animate)
{
    this.Init = function ()
    {
        $scope.NotUpdate = false;
        $scope.ToRight = false;
        $scope.ToLeft = false;
        $scope.Page = Number(localStorage.getItem("Page"));
        $scope.Pages = JSON.parse(localStorage.getItem("Pages"));

        if ($scope.Pages == null)
        {
            $scope.Page = 1;
            $scope.Pages = ["Mon journal de rêves", "Ceci est un journal de rêve.\r\nIl a pour but de noter les rêves que vous avez faits afin de vous aider à vous les remémorer. C'est une pratique conseillée pour faire plus souvent des rêves lucides.\r\nCe journal n'est rien qu'à vous. Le texte saisi ici est stocké en local, et personne d'autre que vous n'y a accès."];
        }

        $scope.$watchCollection("Pages", function (newValue, oldValue)
        {
            //var pageDroite = $scope.Page * 2;

            //if (newValue[pageDroite] != oldValue[pageDroite]) // Page de Droite.
            //{
            //    if ($scope.NotUpdate)
            //    {
            //        $scope.Pages[pageDroite] = oldValue[pageDroite];
            //        $scope.NotUpdate = false;
            //    }
            //}
            //else // Page de Gauche.
            //{
            //    if ($scope.NotUpdate)
            //    {
            //        $scope.Pages[pageDroite - 1] = oldValue[pageDroite - 1];
            //        $scope.NotUpdate = false;
            //    }
            //}

            localStorage.setItem("Page", $scope.Page);
            localStorage.setItem("Pages", JSON.stringify($scope.Pages));
        });

        var pageTransition = angular.element(document.getElementById("PageTransition"));

        pageTransition.on("animationend", function ()
        {
            $scope.$apply(function ()
            {
                $scope.ToRight = false;
                $scope.ToLeft = false;
            });
        });
    }

    $scope.GetLeftPageIndex = function ()
    {
        if ($scope.ToRight)
            return ($scope.Page * 2) - 3;

        return ($scope.Page * 2) - 1;
    }

    $scope.GetRightPageIndex = function ()
    {
        if ($scope.ToLeft)
            return ($scope.Page * 2) + 2;

        return $scope.Page * 2;
    }

    $scope.TextToRight = function (textareaId)
    {
        $scope.NotUpdate = !$scope.NotUpdate;
        if ($scope.NotUpdate)
        {
            /**@type {string}*/
            var text = angular.copy($scope.Pages[($scope.Page * 2) - 1]);

            $scope.Pages[($scope.Page * 2) - 1] = $scope.Pages[($scope.Page * 2) - 1].trim();

            if ($scope.Pages[($scope.Page * 2) - 1] == text)
            {
                var mots = text.split(" ");

                $scope.Pages[$scope.Page * 2] = `${mots.pop()}${$scope.Pages[$scope.Page * 2] != "" ? " " : ""}${$scope.Pages[$scope.Page * 2]}`;
                $scope.Pages[($scope.Page * 2) - 1] = mots.join(" ");
            }
        }

        var textbox = document.getElementById("textbox-right");
        textbox.focus();

        var firstMot = $scope.Pages[($scope.Page * 2)].split(" ")[0];
        textbox.selectionEnd = firstMot.length;
    }

    $scope.TextToNextPage = function (textareaId)
    {
        //$scope.NotUpdate = !$scope.NotUpdate;
        //if ($scope.NotUpdate)
        //{
        //    /**@type {string}*/
        //    var text = angular.copy($scope.Pages[($scope.Page * 2) - 1]);

        //    $scope.Pages[($scope.Page * 2) - 1] = $scope.Pages[($scope.Page * 2) - 1].trim();

        //    if ($scope.Pages[($scope.Page * 2) - 1] == text)
        //    {
        //        var mots = text.split(" ");

        //        $scope.Pages[$scope.Page * 2] = `${mots.pop()}${$scope.Pages[$scope.Page * 2] != "" ? " " : ""}${$scope.Pages[$scope.Page * 2]}`;
        //        $scope.Pages[($scope.Page * 2) - 1] = mots.join(" ");
        //    }
        //}

        //var textbox = document.getElementById("textbox-right");
        //textbox.focus();

        //var firstMot = $scope.Pages[($scope.Page * 2)].split(" ")[0];
        //textbox.selectionEnd = firstMot.length;
    }

    $scope.TournerGauche = function ()
    {
        $scope.ToRight = false;
        $scope.ToLeft = true;
        $scope.Page--;
        $scope.Recto = ($scope.Page * 2) + 1;
        $scope.Verso = ($scope.Page * 2);
    }

    $scope.TournerDroite = function ()
    {
        $scope.ToRight = true;
        $scope.ToLeft = false;
        $scope.Page++;
        $scope.Recto = ($scope.Page * 2) - 1;
        $scope.Verso = ($scope.Page * 2) - 2;
    }
}