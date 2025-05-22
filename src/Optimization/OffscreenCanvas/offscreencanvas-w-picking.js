import init, {pickPosition, state} from "./shared-picking.js";

let sendMouse;

export function OffscreenCanvasWPicking() {

    const canvas = document.querySelector('#c');

    if (canvas.transferControlToOffscreen) {
        startWorker(canvas);
    } else {
        startMainPage(canvas);
    }

    function getCanvasRelativePositon(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height,
        }
    }

    function setPickPosition(event) {
        const pos = getCanvasRelativePositon(event);
        sendMouse(
            (pos.x / canvas.width) * 2 - 1,
            (pos.y / canvas.height) * -2 + 1,
        )
    }

    function clearPickPosition() {
        sendMouse(-100000, -100000)
    }

    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);

    window.addEventListener('touchstart', (event) => {
        event.preventDefault();
        setPickPosition(event.touches[0]);
    }, {passive: false});

    window.addEventListener('touchmove', (event) => {
        setPickPosition(event.touches[0]);
    })

    window.addEventListener('touchend', clearPickPosition)
}

function startWorker(canvas) {
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker(new URL("./offscreencanvas-worker-picking.js", import.meta.url), {type: "module"});
    worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);

    sendMouse = (x, y) => {
        worker.postMessage({type: 'mouse', x, y});
    }

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

    sendMouse = (x, y) => {
        pickPosition.x = x;
        pickPosition.y = y;
    }

    function sendSize() {
        state.width = canvas.clientWidth;
        state.height = canvas.clientHeight;
    }

    window.addEventListener('resize', sendSize);
    sendSize();

    console.log('using regular canvas')
}