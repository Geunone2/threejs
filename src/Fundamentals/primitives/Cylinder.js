import * as THREE from 'three';

export default function Cylinder() {

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


    // 실린더 크기 설정
    const radiusTop = 4;
    const radiusBottom = 4;
    const height = 8;
    const radialSegments = 12;
    const heightSegments = 2;
    const openEnded = false;
    const thetaStart = Math.PI * 0.25;
    const thetaEnd = Math.PI * 1.5;

    const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaEnd);


    const cylinderMaterial = new THREE.MeshBasicMaterial({color: 0x44aa88, side: THREE.DoubleSide});
    const cylinderWireframeMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true});

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    const cylinderWireframe = new THREE.Mesh(cylinderGeometry, cylinderWireframeMaterial);

    scene.add(cylinder);
    scene.add(cylinderWireframe);


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

        cylinder.rotation.x = time;
        cylinder.rotation.y = time;
        cylinderWireframe.rotation.x = time;
        cylinderWireframe.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}