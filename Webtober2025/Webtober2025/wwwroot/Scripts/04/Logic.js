export function LoadCam() {
    var buffer = [];
    var BUFFER_SIZE = 25;

    function AddToBuffer(image) {
        buffer.unshift(image);

        while (buffer.length > BUFFER_SIZE) {
            buffer.pop();
        }
    }

    async function UpdateEffect() {
        const canvas = document.getElementById('effect');
        const ctx = canvas.getContext('2d');

        // Si les dimensions vidéo changent, tu peux adapter :
        // canvas.width = buffer[0]?.width ?? canvas.width;
        // canvas.height = buffer[0]?.height ?? canvas.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Snapshot pour éviter que le buffer soit modifié pendant le dessin
        const frames = buffer.slice();
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const alpha = 1 - (i / BUFFER_SIZE);
            ctx.globalAlpha = alpha;
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
        }
        ctx.globalAlpha = 1;
    }

    async function StartCapturing(video) {
        // Canvas de capture (hors-DOM)
        const grab = document.createElement('canvas');
        const gctx = grab.getContext('2d');
        grab.width = video.videoWidth;
        grab.height = video.videoHeight;

        async function captureFrame() {
            gctx.drawImage(video, 0, 0, grab.width, grab.height);
            // 👉 Pas de dataURL : on fabrique directement un ImageBitmap (très rapide)
            const bitmap = await createImageBitmap(grab);
            AddToBuffer(bitmap);

            // Capture toutes les 200 ms (5 images/s)
            setTimeout(captureFrame, 20);
        }

        captureFrame();
    }

    function AnimationLoop() {
        UpdateEffect().catch(console.error);
        requestAnimationFrame(AnimationLoop);
    }

    // Demander l'acces à la caméra.
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(async function (stream) {
            // Afficher le flux vidéo dans l'élément video.
            var video = document.getElementById('video');
            video.srcObject = stream;
            video.play();

            video.addEventListener('playing', function () {
                StartCapturing(video);
                AnimationLoop();
            });
        })
        .catch(function (err) {
            console.log("Une erreur s'est produite: " + err);
        });
}

export function DisposeCam() {
    var video = document.getElementById('video');
    var stream = video.srcObject;
    var tracks = stream?.getTracks();
    tracks?.forEach(function (track) {
        track.stop();
    });
    video.srcObject = null;
}
