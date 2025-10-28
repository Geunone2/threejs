import * as THREE from 'three';

class ResourceTracker {
    constructor() {
        this.resources = new Set();
    }

    track(resource) {

        if (resource.dispose || resource instanceof THREE.Object3D) {
            this.resources.add(resource);
        }
        return resource;
    }

    untrack(resource) {
        this.resources.delete(resource);
    }

    dispose() {
        for (const resource of this.resources) {
            if (resource instanceof THREE.Object3D) {
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }

            if (resource.dispose) {
                resource.dispose();
            }
        }
        this.resources.clear();
    }
}

export default function CleanUp() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);

    camera.position.z = 2;

    // 씬 생성
    const scene = new THREE.Scene();
    const cubes = [];

    function addStuffToScene() {

        const resTracker = new ResourceTracker();
        const track = resTracker.track.bind(resTracker);

        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = track(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth));

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejs.org/manual/examples/resources/images/wall.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = track(new THREE.MeshBasicMaterial({
            map: track(texture),
        }));
        const cube = track(new THREE.Mesh(geometry, material));
        scene.add(cube);
        cubes.push(cube); // add to our list of cubes to rotate
        return resTracker;

    }

    function waitSeconds(seconds = 0) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    async function process() {
        for (; ;) {
            const resTracker = addStuffToScene();
            await waitSeconds(2);
            cubes.length = 0;
            resTracker.dispose();
            await waitSeconds(1);
        }
    }

    process();

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
        cubes.forEach((cube, ndx) => {
            const speed = .2 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}