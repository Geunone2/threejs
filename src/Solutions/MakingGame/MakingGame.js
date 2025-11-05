import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js"

export function MakingGame() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 20, 40);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    function addLight(...pos) {
        const color = 0xFFFFFF;
        const intensity = 2.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
        scene.add(light.target);
    }

    addLight(5, 5, 2);
    addLight(-5, 5, 5);

    const manager = new THREE.LoadingManager();
    manager.onLoad = init;

    const progressbarElem = document.querySelector('#progressbar');
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}`
    };

    const models = {
        pig: {url: 'https://threejs.org/manual/examples/resources/models/animals/Pig.gltf'},
        cow: {url: 'https://threejs.org/manual/examples/resources/models/animals/Cow.gltf'},
        llama: {url: 'https://threejs.org/manual/examples/resources/models/animals/Llama.gltf'},
        pug: {url: 'https://threejs.org/manual/examples/resources/models/animals/Pug.gltf'},
        sheep: {url: 'https://threejs.org/manual/examples/resources/models/animals/Sheep.gltf'},
        zebra: {url: 'https://threejs.org/manual/examples/resources/models/animals/Zebra.gltf'},
        horse: {url: 'https://threejs.org/manual/examples/resources/models/animals/Horse.gltf'},
        knight: {url: 'https://threejs.org/manual/examples/resources/models/knight/KnightCharacter.gltf'},
    };
    {
        const gltfLoader = new GLTFLoader(manager);
        for (const model of Object.values(models)) {
            gltfLoader.load(model.url, (gltf) => {
                model.gltf = gltf;
            })
        }
    }

    function prepModelAndAnimations() {
        Object.values(models).forEach((model) => {
            const animsByName = {};
            model.gltf.animations.forEach(clip => {
                animsByName[clip.name] = clip;
            });
            model.animations = animsByName;
        });
    }

    const mixerInfos = [];

    function init() {
        const loadingElem = document.querySelector('#loading');
        loadingElem.style.display = 'none';

        prepModelAndAnimations();

        Object.values(models).forEach((model, ndx) => {
            const clonedScene = SkeletonUtils.clone(model.gltf.scene);
            const root = new THREE.Object3D();
            root.add(clonedScene);
            scene.add(root);
            root.position.x = (ndx - 3) * 3;

            const mixer = new THREE.AnimationMixer(clonedScene);
            const actions = Object.values(model.animations).map((clip) => {
                return mixer.clipAction(clip);
            });
            const mixerInfo = {
                mixer,
                actions,
                actionNdx: -1,
            };
            mixerInfos.push(mixerInfo);
            playNextAction(mixerInfo);
        });
    }

    function playNextAction(mixerInfo) {
        const {actions, actionNdx} = mixerInfo;
        const nextActionNdx = (actionNdx + 1) % actions.length;
        mixerInfo.actionNdx = nextActionNdx;
        actions.forEach((action, ndx) => {
            const enabled = ndx === nextActionNdx;
            action.enabled = enabled;
            if (enabled) {
                action.play();
            }
        })
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

    let then = 0;

    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        for (const {mixer} of mixerInfos) {
            mixer.update(deltaTime);
        }

        renderer.render(scene, camera);


        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    window.addEventListener('keydown', (e) => {
        const mixerInfo = mixerInfos[e.keyCode - 49];
        if (!mixerInfo) {
            return;
        }
        playNextAction(mixerInfo);
    })
}