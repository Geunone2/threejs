import * as THREE from 'three';

export default function Icosahedron() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 12);

    camera.position.z = 6;

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

    // 정이십면체 크기 설정
    const radius = 2;
    // const detail = 2; 각 삼각형 면을 세분화 ~ 더 부드러운 구형
    const icosahedronGeometry = new THREE.IcosahedronGeometry(radius);

    const icosahedronMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88});
    const icosahedronWireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    const icosahedronWireframe = new THREE.Mesh(icosahedronGeometry, icosahedronWireframeMaterial);

    scene.add(icosahedron);
    scene.add(icosahedronWireframe);

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

        icosahedron.rotation.x = time;
        icosahedron.rotation.y = time;
        icosahedronWireframe.rotation.x = time;
        icosahedronWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}