import * as THREE from 'three';

export function TorusKnot() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 6, 30);

    camera.position.z = 16;

    // 씬 생성
    const scene = new THREE.Scene();

    // 밝기 설정
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // 매듭 설정
    const radius = 4;
    const tubeRadius = 1.5;
    const radialSegments = 20;
    const tubularSegments = 35;
    const p = 2;
    const q = 3;

    const torusKnotGeometry = new THREE.TorusKnotGeometry(radius, tubeRadius, radialSegments, tubularSegments, p, q);

    const torusKnotMaterial = new THREE.MeshNormalMaterial({color: 0x808080});

    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);

    scene.add(torusKnot);

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

    function render(time) {
        time *= 0.0002;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        torusKnot.rotation.x = time;
        torusKnot.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}