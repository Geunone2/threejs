import * as THREE from 'three'

export default function Cube1() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

    // 씬
    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // 박스 기하 구조; BoxGeometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const material = new THREE.MeshPhongMaterial({color: 0x44aa88})

    // 큐브 생성
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    renderer.render(scene, camera);

    // 큐브 시간 기준으로 X & Y축으로 회전
    function render(time) {
        time *= 0.001

        cube.rotation.x = time;
        cube.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}