import * as THREE from 'three';

export default function CubeMips() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 0.3);

    camera.position.z = 0.18;

    // 씬 생성
    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(0.002, 0.002, 0.002);

    // 텍스처 설정
    const loader = new THREE.TextureLoader();

    const texture = loader.load(`/mip-low-res-enlarged.png`);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
        map: texture,
    })

    const box = new THREE.Mesh(geometry, material);
    scene.add(box);


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

        box.rotation.x = time;
        box.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }


    requestAnimationFrame(render);
}