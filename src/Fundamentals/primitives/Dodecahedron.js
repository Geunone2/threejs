import * as THREE from 'three';

export default function Dodecahedron() {

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

    // 십이면체 크기 설정
    const radius = 2;
    const detail = 2; // 각 면을 16개로 세분화하여 더욱 부드럽게 함, detail이 클 수록 구와 비슷한 형태
    const DodecahedronGeometry = new THREE.DodecahedronGeometry(radius, detail);

    const DodecahedronMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88});
    const DodecahedronWireFrameMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const dodecahedron = new THREE.Mesh(DodecahedronGeometry, DodecahedronMaterial);
    const dodecahedronWireframe = new THREE.Mesh(DodecahedronGeometry, DodecahedronWireFrameMaterial);

    scene.add(dodecahedron);
    scene.add(dodecahedronWireframe);

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

        dodecahedron.rotation.x = time;
        dodecahedron.rotation.y = time;
        dodecahedronWireframe.rotation.x = time;
        dodecahedronWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}