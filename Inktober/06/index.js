"use strict"

var module = angular.module("Inktober", ["ngMaterial"]);

module.controller("Controller", Controller);

function Controller($scope)
{
    this.Init = function ()
    {
        const scratchCard = document.getElementById("scratchCard");
        const scratchLayer = document.getElementById("scratchLayer");
        const message = document.getElementById("message");

        let isScratching = false;

        scratchLayer.addEventListener("mousedown", startScratch);
        scratchLayer.addEventListener("mousemove", scratch);
        scratchLayer.addEventListener("mouseup", stopScratch);
        scratchLayer.addEventListener("mouseout", stopScratch);

        /**@type {CanvasRenderingContext2D} */
        const ctx = scratchLayer.getContext("2d");
        ctx.fillRect(0, 0, scratchLayer.width, scratchLayer.height)

        function startScratch()
        {
            isScratching = true;
            message.style.display = "none";
        }

        function scratch(e)
        {
            if (!isScratching) return;

            const rect = scratchLayer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const radius = 20; // Taille du pinceau à gratter


            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
        }

        function stopScratch()
        {
            isScratching = false;

            // Vérifiez si une certaine partie est grattée pour décider si le joueur a gagné
            const imageData = ctx
                .getImageData(0, 0, scratchLayer.width, scratchLayer.height)
                .data;

            const pixels = imageData.filter((value) => value === 0);

            if (pixels.length > 0.6 * (scratchLayer.width * scratchLayer.height))
            {
                message.innerText = "Félicitations ! Vous avez gagné !";
                message.style.display = "block";
            }
        }
    }

}