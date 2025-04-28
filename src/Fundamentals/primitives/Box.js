import * as THREE from 'three';

export default function Box() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 24);

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

    // 박스 크기 설정

    const BoxGeometry = new THREE.BoxGeometry(6, 6, 6, 4, 4, 4);

    const BoxMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88});
    const BoxWireFrameMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const cube = new THREE.Mesh(BoxGeometry, BoxMaterial);
    const cubeWireframe = new THREE.Mesh(BoxGeometry, BoxWireFrameMaterial);

    scene.add(cube);
    scene.add(cubeWireframe);

    renderer.render(scene, camera);

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

        cube.rotation.x = time;
        cube.rotation.y = time;
        cubeWireframe.rotation.x = time;
        cubeWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}