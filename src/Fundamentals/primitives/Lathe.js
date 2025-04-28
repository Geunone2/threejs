import * as THREE from 'three';

export default function Lathe() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 32);

    camera.position.z = 24;

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

    // 선을 회전 시켜 만든 모형 크기 설정
    /*
    const points = [];
    for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
    }
    */
    const points = [];
    for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
    }

    const segment = 12;
    const phiStart = Math.PI * 0.25;
    const phiLength = Math.PI * 1.5;

    const latheGeometry = new THREE.LatheGeometry(points, segment, phiStart, phiLength);

    const latheMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88, side: THREE.DoubleSide});
    const latheWireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const lathe = new THREE.Mesh(latheGeometry, latheMaterial);
    const latheWireframe = new THREE.Mesh(latheGeometry, latheWireframeMaterial);

    scene.add(lathe);
    scene.add(latheWireframe);

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

        lathe.rotation.x = time;
        lathe.rotation.y = time;
        latheWireframe.rotation.x = time;
        latheWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}