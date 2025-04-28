import * as THREE from 'three';

export default function Extrude() {

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


    // 돌출 모양 크기 설정
    const shape = new THREE.Shape(); // 하트 모양(shape) 정의

    // 도형 초기 위치 (x, y) 설정
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);

// 베지어 곡선을 사용하여 하트 모양을 정의
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
        steps: 2, // 압출 방향으로 분할할 단계 수
        depth: 2, // 압출될 깊이
        bevelEnabled: true, // 베벨(모서리 둥글게 처리) 활성화 여부
        bevelThickness: 1,  // 베벨 두께
        bevelSize: 1,       // 베벨 크기
        bevelSegments: 2,   // 베벨에 사용할 세그먼트 개수
    };

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const extrudeMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88, side: THREE.DoubleSide});
    const extrudeWireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const extrude = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
    const extrudeWireframe = new THREE.Mesh(extrudeGeometry, extrudeWireframeMaterial);

    scene.add(extrude);
    scene.add(extrudeWireframe);


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

        extrude.rotation.x = time;
        extrude.rotation.y = time;
        extrudeWireframe.rotation.x = time;
        extrudeWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}