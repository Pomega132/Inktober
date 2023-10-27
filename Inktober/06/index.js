"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

function Controller($scope)
{
    this.Init = function ()
    {
        const scratchSvg = document.getElementById("scratchSvg");
        const scratchGroup = document.getElementById("scratchGroup");
        const hiddenText = document.getElementById("hiddenText");

        let isScratching = false;

        scratchSvg.addEventListener("mousedown", startScratch);
        scratchSvg.addEventListener("mousemove", scratch);
        scratchSvg.addEventListener("mouseup", stopScratch);

        function startScratch(e)
        {
            isScratching = true;
            scratch(e);
        }

        function scratch(e)
        {
            if (!isScratching) return;

            const pointSize = 20; // Taille du point à gratter
            const rect = scratchSvg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Crée un cercle masque autour du point cliqué
            const mask = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            mask.setAttribute("cx", x);
            mask.setAttribute("cy", y);
            mask.setAttribute("r", pointSize);
            mask.setAttribute("fill", "#000"); // Couleur du masque

            // Applique le masque au groupe de grattage
            scratchGroup.appendChild(mask);
        }

        function stopScratch()
        {
            isScratching = false;
        }
    }
}