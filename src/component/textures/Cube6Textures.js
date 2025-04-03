import * as THREE from 'three';

export default function Cube6Textures() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 16);

    camera.position.z = 8;

    // 씬 생성
    const scene = new THREE.Scene();

    // 텍스처 설정
    const cubes = [];

    // 여러 텍스처가 로드될 때까지 대기
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    // 박스 크기 설정
    const boxGeometry = new THREE.BoxGeometry(5, 1, 5);

    // 직육면체에 텍스처(이미지) 삽입
    const boxMaterials = [
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/JavaBanner.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/JsBanner.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/black.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/black.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/SpringBanner.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/TsBanner.png')}),
    ];

    loadManager.onLoad = () => {

        const cube = new THREE.Mesh(boxGeometry, boxMaterials);

        scene.add(cube);
        cubes.push(cube);

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

            cube.rotation.y = time;

            renderer.render(scene, camera);

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);

    }


    function loadColorTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
}