import * as THREE from "three";

export default function PreventingCanvas() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        preserveDrawingBuffer: true,
        alpha: true,
        antialias: true
    });
    renderer.autoClearColor = false;

    const camera = new THREE.OrthographicCamera(-2, 2, 1, -1, -1, 1);

    const scene = new THREE.Scene();

    // 조명 설정
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const base = new THREE.Object3D();
    scene.add(base);
    base.scale.set(0.1, 0.1, 0.1);

    function makeInstance(geometry, color, x, y, z) {
        const material = new THREE.MeshPhongMaterial({color});
        const cube = new THREE.Mesh(geometry, material);
        base.add(cube);

        cube.position.set(x, y, z);

        return cube;
    }

    makeInstance(geometry, '#F00', -2, 0, 0);
    makeInstance(geometry, '#FF0', 2, 0, 0);
    makeInstance(geometry, '#0F0', 0, -2, 0);
    makeInstance(geometry, '#0FF', 0, 2, 0);
    makeInstance(geometry, '#00F', 0, 0, -2);
    makeInstance(geometry, '#F0F', 0, 0, 2);

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

    const state = {x: 0, y: 0};

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.right = canvas.clientWidth / canvas.clientHeight;
            camera.left = -camera.right;
            camera.updateProjectionMatrix();
        }

        base.position.set(state.x, state.y, 0);
        base.rotation.x = time;
        base.rotation.y = time * 1.11;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    function getCanvasRelativePosition(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * canvas.width / rect.width,
            y: (e.clientY - rect.top) * canvas.height / rect.height
        };
    }

    const temp = new THREE.Vector3();

    function setPosition(e) {
        const pos = getCanvasRelativePosition(e);
        const x = pos.x / canvas.width * 2 - 1;
        const y = pos.y / canvas.height * -2 + 1;
        temp.set(x, y, 0).unproject(camera);
        state.x = temp.x;
        state.y = temp.y;
    }

    canvas.addEventListener('mousemove', setPosition);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        setPosition(e.touches[0]);
    }, {passive: false});

}