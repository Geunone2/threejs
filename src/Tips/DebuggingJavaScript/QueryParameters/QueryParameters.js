import * as THREE from "three";

export default function QueryParameters() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 50;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 20;

    // 씬
    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshBasicMaterial({color: "#FDFD96"});

    const things = [];

    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }

    function createThing() {
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        things.push({
            mesh,
            timer: 2,
            velocity: new THREE.Vector3(rand(-5, 5), rand(-5, 5), rand(-5, 5))
        })
    }

    canvas.addEventListener('click', createThing);

    function getQuery() {
        return Object.fromEntries(new URLSearchParams(window.location.search).entries());
    }


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    let then = 0;

    const query = getQuery();
    const debug = query.debug === 'true';
    const logger = debug
        ? new ClearingLogger(document.querySelector('#debug pre'))
        : new DummyLogger();
    if (debug) {
        document.querySelector('#debug').style.display = '';
    }

    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        if (resizeRendererToDisplaySize(renderer)) {

            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

        }

        logger.log('fps:', (1 / deltaTime).toFixed(1));
        logger.log('num things:', things.length);

        for (let i = 0; i < things.length;) {
            const thing = things[i];
            const mesh = thing.mesh;
            const pos = mesh.position;
            logger.log(
                'timer', thing.timer.toFixed(3),
                'pos', pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3));
            thing.timer -= deltaTime;
            if (thing.timer <= 0) {
                things.splice(i, 1);
                scene.remove(mesh);
            } else {
                mesh.position.addScaledVector(thing.velocity, deltaTime);
                ++i;
            }
        }

        renderer.render(scene, camera);
        logger.render();

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

class ClearingLogger {
    constructor(elem) {
        this.elem = elem;
        this.lines = [];
    }

    log(...args) {
        this.lines.push([...args].join(" "));
    }

    render() {
        this.elem.textContent = this.lines.join("\n");
        this.lines = [];
    }
}


class DummyLogger {
    log() {
    }

    render() {
    }
}