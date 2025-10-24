import * as THREE from 'three';

export default function CubeCanvasTexture() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);

    camera.position.z = 2;

    // 씬 생성
    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const cubes = [];

    const ctx = document.createElement('canvas').getContext('2d');
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const texture = new THREE.CanvasTexture(ctx.canvas);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubes.push(cube);

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

    function randInt(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min | 0;
    }

    function drawRandomDot() {
        ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;

        ctx.beginPath();

        const x = randInt(256);
        const y = randInt(256);
        const radius = randInt(10, 64);
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        ctx.fill();
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        drawRandomDot();
        texture.needsUpdate = true;

        cubes.forEach((cube, ndx) => {
            const speed = .2 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        })
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}