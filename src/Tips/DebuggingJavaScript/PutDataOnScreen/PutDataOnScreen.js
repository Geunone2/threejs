import * as THREE from 'three';

export default function PutDataOnScreen() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // x, y, z 설정
    const xElem = document.querySelector('#x');
    const yElem = document.querySelector('#y');
    const zElem = document.querySelector('#z');

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 50);

    camera.position.z = 20;

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

    const CircleGeometry = new THREE.SphereGeometry();

    const CircleMaterial = new THREE.MeshBasicMaterial({color: "#FDFD96"});

    const circle = new THREE.Mesh(CircleGeometry, CircleMaterial);

    scene.add(circle);

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
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        circle.position.set(
            Math.sin(time * 1.2) * 5,
            Math.sin(time * 1.1) * 5,
            Math.sin(time * 1.3) * 10,
        )
        xElem.textContent = circle.position.x.toFixed(3);
        yElem.textContent = circle.position.y.toFixed(3);
        zElem.textContent = circle.position.z.toFixed(3);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}