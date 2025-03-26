import * as THREE from 'three';

export default function Stump() {

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
    const radiusTop = 10;
    const radiusBottom = 10;
    const height = 1;
    const radialSegments = 12;

    const stumpGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);

    const stumpMaterial = new THREE.MeshBasicMaterial({color: 0xF00000});
    const stump = new THREE.Mesh(stumpGeometry, stumpMaterial);

    scene.add(stump);

    renderer.render(scene, camera);

    stumpGeometry.computeBoundingBox();
    if (stumpGeometry.boundingBox) {
        const centerX = (stumpGeometry.boundingBox.max.x + stumpGeometry.boundingBox.min.x) / 2;
        const centerY = (stumpGeometry.boundingBox.max.y + stumpGeometry.boundingBox.min.y) / 2;
        const centerZ = (stumpGeometry.boundingBox.max.z + stumpGeometry.boundingBox.min.z) / 2;
        stumpGeometry.translate(-centerX, -centerY, -centerZ);
    }

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

        stump.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}