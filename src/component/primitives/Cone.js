import * as THREE from 'three';

export default function Cone() {

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


    // 원뿔 크기 설정
    const radius = 6;
    const height = 8;
    const radiaSegments = 16; // 밑면 분할 갯수
    const heightSegments = 2; // 세로 분할 개수

    const openEnded = true; // 밑면 없애기

    const thetaStart = Math.PI * 0.25; // 원뿔이 시작하는 각도 (45°)
    const thetaEnd = Math.PI * 1.5;    // 원뿔이 차지하는 각도 (270°)

    const coneGeometry = new THREE.ConeGeometry(radius, height, radiaSegments, heightSegments, openEnded, thetaStart, thetaEnd);


    const coneMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88, side: THREE.DoubleSide});
    const coneWireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    const coneWireframe = new THREE.Mesh(coneGeometry, coneWireframeMaterial);

    scene.add(cone);
    scene.add(coneWireframe);


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
        time *= 0.0006;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cone.rotation.x = time;
        cone.rotation.y = time;
        coneWireframe.rotation.x = time;
        coneWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}