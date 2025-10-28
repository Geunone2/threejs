import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

class ResourceTracker {
    constructor() {
        this.resources = new Set();
    }

    track(resource) {
        if (!resource) {
            return resource;
        }

        if (Array.isArray(resource)) {
            resource.forEach(resource => this.track(resource));
            return resource;
        }

        if (resource.dispose || resource instanceof THREE.Object3D) {
            this.resources.add(resource);
        }

        if (resource instanceof THREE.Object3D) {
            this.track(resource.geometry);
            this.track(resource.material);
            this.track(resource.children);
        } else if (resource instanceof THREE.Material) {
            for (const value of Object.values(resource)) {
                if (value instanceof THREE.Texture) {
                    this.track(value);
                }
            }

            // We also have to check if any uniforms reference textures or arrays of textures
            if (resource.uniforms) {
                for (const value of Object.values(resource.uniforms)) {
                    if (value) {
                        const uniformValue = value.value;
                        if (uniformValue instanceof THREE.Texture ||
                            Array.isArray(uniformValue)) {

                            this.track(uniformValue);
                        }
                    }
                }
            }
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

export default function CleanUpGLTF() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('lightblue');

    function addLight(...pos) {
        const color = 0xFFFFFF;
        const intensity = 2.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
    }

    addLight(-1, 2, 4);
    addLight(2, -2, 3);

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {

        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();

        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);

    }

    const gltfLoader = new GLTFLoader();

    function loadGLTF(url) {
        return new Promise((resolve, reject) => {
            gltfLoader.load(url, resolve, undefined, reject);
        });
    }

    function waitSeconds(seconds = 0) {

        return new Promise(resolve => setTimeout(resolve, seconds * 1000));

    }

    const fileURLs = [
        'https://threejs.org/manual/examples/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf',
        'https://threejs.org/manual/examples/resources/models/3dbustchallange_submission/scene.gltf',
        'https://threejs.org/manual/examples/resources/models/mountain_landscape/scene.gltf',
        'https://threejs.org/manual/examples/resources/models/simple_house_scene/scene.gltf',
    ];

    async function loadFiles() {

        for (; ;) {

            for (const url of fileURLs) {

                const resMgr = new ResourceTracker();
                const track = resMgr.track.bind(resMgr);
                const gltf = await loadGLTF(url);
                const root = track(gltf.scene);
                scene.add(root);

                const box = new THREE.Box3().setFromObject(root);

                const boxSize = box.getSize(new THREE.Vector3()).length();
                const boxCenter = box.getCenter(new THREE.Vector3());

                frameArea(boxSize * 1.1, boxSize, boxCenter, camera);

                await waitSeconds(2);
                renderer.render(scene, camera);

                resMgr.dispose();

                await waitSeconds(1);
            }
        }
    }

    loadFiles();

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

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);
}