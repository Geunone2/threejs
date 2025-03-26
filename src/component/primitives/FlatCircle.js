import * as THREE from 'three';

export default function FlatCircle() {

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


    // 원 크기 설정
    const radius = 7;
    const segments = 24;

    const thetaStart = Math.PI * 0.25; // 원이 시작하는 각도 (45°)
    const thetaEnd = Math.PI * 1.5;    // 원이 차지하는 각도 (270°)

    // 45°에서 시작해서 315°(45° + 270°)까지 원의 일부를 생성
    const circleGeometry = new THREE.CircleGeometry(radius, segments, thetaStart, thetaEnd);


    const circleMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88});
    const circleWireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    const circleWireframe = new THREE.Mesh(circleGeometry, circleWireframeMaterial);

    scene.add(circle);
    scene.add(circleWireframe);


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

        circle.rotation.x = time;
        circle.rotation.y = time;
        circleWireframe.rotation.x = time;
        circleWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}