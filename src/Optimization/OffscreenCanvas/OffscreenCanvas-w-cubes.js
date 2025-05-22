import init, {state} from "./shared-cubes.js";

export function OffscreenCanvasWCubes() {

    const canvas = document.querySelector('#c');

    if (canvas.transferControlToOffscreen) {
        startWorker(canvas);
    } else {
        startMainPage(canvas);
    }

}

function startWorker(canvas) {
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker(new URL("./offscreencanvas-worker-cubes.js", import.meta.url), { type: "module" });
    worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);

    function sendSize() {
        worker.postMessage({
            type: 'size',
            width: canvas.clientWidth,
            height: canvas.clientHeight,
        })
    }

    window.addEventListener('resize', sendSize);
    sendSize();

    console.log('using OffscreenCanvasWCubes');
}

function startMainPage(canvas) {
    init({canvas});

    function sendSize() {
        state.width = canvas.clientWidth;
        state.height = canvas.clientHeight;
    }

    window.addEventListener('resize', sendSize);
    sendSize();

    console.log('using regular canvas')
}