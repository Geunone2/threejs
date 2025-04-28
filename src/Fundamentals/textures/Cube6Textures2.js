import * as THREE from 'three';

export default function Cube6Textures2() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 16;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 4;

    const scene = new THREE.Scene();

    const boxWidth = 2;
    const boxHeight = 1;
    const boxDepth = 1;
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const cubes = [];
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    const boxMaterials = [
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/JavaBanner.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/JsBanner.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/black.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/black.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/SpringBanner.png')}),
        new THREE.MeshBasicMaterial({map: loadColorTexture('/banners/TsBanner.png')}),
    ];

    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');

    loadManager.onLoad = () => {

        loadingElem.style.display = 'none';
        const cube = new THREE.Mesh(boxGeometry, boxMaterials);
        scene.add(cube);
        cubes.push(cube); // add to our list of cubes to rotate

    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {

        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;

    };

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

    function loadColorTexture(path) {
        const texture = loader.load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;

    }

    function render(time) {
        time *= 0.001;
        if (resizeRendererToDisplaySize(renderer)) {

            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        cubes.forEach((cube, ndx) => {
            const speed = .2 + ndx * .1;
            const rot = time * speed;
            cube.rotation.y = rot;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}