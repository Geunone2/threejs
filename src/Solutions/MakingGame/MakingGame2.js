import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js"
import {GUI} from 'three/addons/libs/lil-gui.module.min.js'

export function MakingGame2() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 40, 80);

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
        progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`
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
        const box = new THREE.Box3();
        const size = new THREE.Vector3();
        Object.values(models).forEach((model) => {
            box.setFromObject(model.gltf.scene);
            box.getSize(size);
            model.size = size.length();
            console.log('--------->', model.url);
            const animsByName = {};
            model.gltf.animations.forEach(clip => {
                animsByName[clip.name] = clip;
                console.log('    ', clip.name)
                if (clip.name === 'walk') {
                    clip.duration /= 2;
                }
            });
            model.animations = animsByName;
        });
    }

    function removeArrayElement(array, element) {
        const ndx = array.indexOf(element);
        if (ndx >= 0) {
            array.splice(ndx, 1);
        }
    }

    class SafeArray {
        constructor() {
            this.array = [];
            this.addQueue = [];
            this.removeQueue = new Set();
        }

        get isEmpty() {
            return this.addQueue.length + this.array.length > 0;
        }

        add(element) {
            this.addQueue.push(element);
        }

        remove(element) {
            this.removeQueue.add(element);
        }

        forEach(fn) {
            this._addQueued();
            this._removeQueued();
            for (const element of this.array) {
                if (this.removeQueue.has(element)) {
                    continue;
                }
                fn(element);
            }
            this._removeQueued();
        }

        _addQueued() {
            if (this.addQueue.length) {
                this.array.splice(this.array.length, 0, ...this.addQueue);
                this.addQueue = [];
            }
        }

        _removeQueued() {
            if (this.removeQueue.size) {
                this.array = this.array.filter(element => !this.removeQueue.has(element));
                this.removeQueue.clear();
            }
        }
    }

    class GameObjectManager {
        constructor() {
            this.gameObjects = new SafeArray();
        }

        createGameObject(parent, name) {
            const gameObject = new GameObject(parent, name);
            this.gameObjects.add(gameObject);
            return gameObject;
        }

        removeGameObject(gameObject) {
            this.gameObjects.remove(gameObject);
        }

        update() {
            this.gameObjects.forEach((gameObject) => {
                gameObject.update();
            });
        }
    }

    class InputManager {
        constructor() {
            this.keys = {};
            const keyMap = new Map();

            const setKey = (keyName, pressed) => {
                const keyState = this.keys[keyName];
                keyState.justPressed = pressed && !keyState.down;
                keyState.down = pressed;
            };

            const addKey = (keyCode, name) => {
                this.keys[name] = {down: false, justPressed: false};
                keyMap.set(keyCode, name);
            }

            const setKeyFromKeyCode = (KeyCode, pressed) => {
                const keyName = keyMap.get(KeyCode);
                if (!keyName) {
                    return;
                }
                setKey(keyName, pressed);
            };

            addKey(37, 'left');
            addKey(39, 'right');
            addKey(38, 'up');
            addKey(40, 'down');
            addKey(90, 'a');
            addKey(88, 'b');

            window.addEventListener('keydown', (e) => {
                setKeyFromKeyCode(e.keyCode, true);
            });

            window.addEventListener('keyup', (e) => {
                setKeyFromKeyCode(e.keyCode, false);
            });

            const sides = [
                {elem: document.querySelector('#left'), key: 'left'},
                {elem: document.querySelector('#right'), key: 'right'}
            ];

            const clearKeys = () => {
                for (const {key} of sides) {
                    setKey(key, false);
                }
            };

            const handleMouseMove = (e) => {
                e.preventDefault();
                canvas.focus();
                window.addEventListener('pointermove', handleMouseMove);
                window.addEventListener('pointerup', handleMouseUp);

                for (const {elem, key} of sides) {
                    let pressed = false;
                    const rect = elem.getBoundingClientRect();
                    const x = e.clientX;
                    const y = e.clientY;
                    const inRect = x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;

                    if (inRect) {
                        pressed = true;
                    }

                    setKey(key, pressed);
                }
            };

            function handleMouseUp() {
                clearKeys();
                window.removeEventListener('pointermove', handleMouseMove, {passive: false});
                window.removeEventListener('pointerup', handleMouseUp);
            }

            const uiElem = document.querySelector('#ui');
            uiElem.addEventListener('pointerdown', handleMouseMove, {passive: false});
            uiElem.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, {passive: false});
        }

        update() {
            for (const keyState of Object.values(this.keys)) {
                if (keyState.justPressed) {
                    keyState.justPressed = false;
                }
            }
        }
    }

    const kForward = new THREE.Vector3(0, 0, 1);

    const globals = {
        camera,
        canvas,
        debug: true,
        time: 0,
        deltaTime: 0,
        moveSpeed: 16,
        player: null,
        congaLine: [],
    }

    const gameObjectManager = new GameObjectManager();
    const inputManager = new InputManager();

    class GameObject {
        constructor(parent, name) {
            this.name = name;
            this.components = [];
            this.transform = new THREE.Object3D();
            parent.add(this.transform);
        }

        addComponent(ComponentType, ...args) {
            const component = new ComponentType(this, ...args);
            this.components.push(component);
            return component;
        }

        removeComponent(component) {
            removeArrayElement(this.components, component);
        }

        getComponent(ComponentType) {
            return this.components.find(c => c instanceof ComponentType);
        }

        update() {
            for (const component of this.components) {
                component.update();
            }
        }
    }

    class FiniteStateMachine {
        constructor(states, initialState) {
            this.states = states;
            this.transition(initialState);
        }

        get state() {
            return this.currentState;
        }

        transition(state) {
            const oldState = this.states[this.currentState];
            if (oldState && oldState.exit) {
                oldState.exit.call(this);
            }
            this.currentState = state;
            const newState = this.states[state];
            if (newState.enter) {
                newState.enter.call(this);
            }
        }

        update() {
            const state = this.states[this.currentState];
            if (state.update) {
                state.update.call(this);
            }
        }
    }

    // Base for all components
    class Component {
        constructor(gameObject) {
            this.gameObject = gameObject;
        }

        update() {
        };
    }

    const gui = new GUI();
    gui.add(globals, 'debug').onChange(showHideDebugInfo);

    const labelContainerElem = document.querySelector('#labels');

    function showHideDebugInfo() {
        labelContainerElem.style.display = globals.debug ? '' : 'none';
    }

    class StateDisplayHelper extends Component {
        constructor(gameObject, size) {
            super(gameObject);
            this.elem = document.createElement('div');
            labelContainerElem.appendChild(this.elem);
            this.pos = new THREE.Vector3();

            this.helper = new THREE.PolarGridHelper(size / 2, 1, 1, 16);
            gameObject.transform.add(this.helper)
        }

        setState(s) {
            this.elem.textContent = s;
        }

        setColor(cssColor) {
            this.elem.style.color = cssColor;
            this.helper.material.color.set(cssColor);
        }

        update() {
            this.helper.visible = globals.debug;
            if (!globals.debug) {
                return;
            }

            const {pos} = this;
            const {transform} = this.gameObject;
            const {canvas} = globals;
            pos.copy(transform.position);

            pos.project(globals.camera);

            const x = (pos.x * .5 + .5) * canvas.clientWidth;
            const y = (pos.y * -.5 + .5) * canvas.clientHeight;

            this.elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`
        }
    }

    class SkinInstance extends Component {
        constructor(gameObject, model) {
            super(gameObject);
            this.model = model;
            this.animRoot = SkeletonUtils.clone(this.model.gltf.scene);
            this.mixer = new THREE.AnimationMixer(this.animRoot);
            gameObject.transform.add(this.animRoot);
            this.actions = {};
        }

        setAnimation(animName) {
            const clip = this.model.animations[animName];
            for (const action of Object.values(this.actions)) {
                action.enabled = false;
            }

            const action = this.mixer.clipAction(clip);
            action.enabled = true;
            action.reset();
            action.play();
            this.actions[animName] = action;
        }

        update() {
            this.mixer.update(globals.deltaTime)
        }
    }

    class Player extends Component {
        constructor(gameObject) {
            super(gameObject);
            const model = models.knight;
            globals.playerRadius = model.size / 2;
            this.text = gameObject.addComponent(StateDisplayHelper, model.size);
            this.skinInstance = gameObject.addComponent(SkinInstance, model);
            this.skinInstance.setAnimation('Run');
            this.turnSpeed = globals.moveSpeed / 4;
            this.offscreenTimer = 0;
            this.maxTimeOffScreen = 3;
        }

        update() {
            const {deltaTime, moveSpeed, cameraInfo} = globals;
            const {transform} = this.gameObject;
            const delta = (inputManager.keys.left.down ? 1 : 0) +
                (inputManager.keys.right.down ? -1 : 0);
            transform.rotation.y += this.turnSpeed * delta * deltaTime;
            transform.translateOnAxis(kForward, moveSpeed * deltaTime);

            const {frustum} = cameraInfo;
            if (frustum.containsPoint(transform.position)) {
                this.offscreenTimer = 0;
            } else {
                this.offscreenTimer += deltaTime;
                if (this.offscreenTimer >= this.maxTimeOffScreen) {
                    transform.position.set(0, 0, 0);
                }
            }
        }
    }

    function isClose(obj1, obj1Radius, obj2, obj2Radius) {
        const minDist = obj1Radius + obj2Radius;
        const dist = obj1.position.distanceTo(obj2.position);
        return dist < minDist;
    }

    function minMagnitude(v, min) {
        return Math.abs(v) > min
            ? min * Math.sign(v)
            : v;
    }

    const aimTowardAndGetDistance = function () {
        const delta = new THREE.Vector3();

        return function aimTowardAndGetDistance(source, targetPos, maxTurn) {
            delta.subVectors(targetPos, source.position);
            const targetRot = Math.atan2(delta.x, delta.z) + Math.PI * 1.5;
            const deltaRot = (targetRot - source.rotation.y + Math.PI * 1.5) % (Math.PI * 2) - Math.PI;
            const deltaRotation = minMagnitude(deltaRot, maxTurn);

            source.rotation.y = THREE.MathUtils.euclideanModulo(
                source.rotation.y + deltaRotation, Math.PI * 2);

            return delta.length();
        }
    }();

    class Animal extends Component {
        constructor(gameObject, model) {
            super(gameObject);
            this.helper = gameObject.addComponent(StateDisplayHelper, model.size);
            const hitRadius = model.size / 2;
            const skinInstance = gameObject.addComponent(SkinInstance, model);
            skinInstance.mixer.timeScale = globals.moveSpeed / 4;
            const transform = gameObject.transform;
            const playerTransform = globals.player.gameObject.transform;
            const maxTurnSpeed = Math.PI * (globals.moveSpeed / 4);
            const targetHistory = [];
            let targetNdx = 0;

            function addHistory() {
                const targetGO = globals.congaLine[targetNdx];
                const newTargetPos = new THREE.Vector3();
                newTargetPos.copy(targetGO.transform.position);
                targetHistory.push(newTargetPos);
            }

            this.fsm = new FiniteStateMachine({
                idle: {
                    enter: () => {
                        skinInstance.setAnimation('Idle');
                    },
                    update: () => {
                        if (isClose(transform, hitRadius, playerTransform, globals.playerRadius)) {
                            this.fsm.transition('waitForEnd');
                        }
                    }
                },
                waitForEnd: {
                    enter: () => {
                        skinInstance.setAnimation('Jump');
                    },
                    update: () => {
                        const lastGO = globals.congaLine[globals.congaLine.length - 1];
                        const deltaTurnSpeed = maxTurnSpeed * globals.deltaTime;
                        const targetPos = lastGO.transform.position;
                        aimTowardAndGetDistance(transform, targetPos, deltaTurnSpeed);
                        if (isClose(transform, hitRadius, lastGO.transform, globals.playerRadius)) {
                            this.fsm.transition('goToLast');
                        }
                    }
                },
                goToLast: {
                    enter: () => {
                        targetNdx = globals.congaLine.length - 1;
                        globals.congaLine.push(gameObject);
                        skinInstance.setAnimation('Walk');
                    },
                    update: () => {
                        addHistory();
                        const targetPos = targetHistory[0];
                        const maxVelocity = globals.moveSpeed * globals.deltaTime;
                        const deltaTurnSpeed = maxTurnSpeed * globals.deltaTime;
                        const distance = aimTowardAndGetDistance(transform, targetPos, deltaTurnSpeed);
                        const velocity = distance;
                        transform.translateOnAxis(kForward, Math.min(velocity, maxVelocity));
                        if (distance <= maxVelocity) {
                            this.fsm.transition('follow');
                        }
                    },
                },
                follow: {
                    update: () => {
                        addHistory();
                        const targetPos = targetHistory.shift();
                        transform.position.copy(targetPos);
                        const deltaTurnSpeed = maxTurnSpeed * globals.deltaTime;
                        aimTowardAndGetDistance(transform, targetHistory[0], deltaTurnSpeed);
                    }
                }
            }, 'idle');
        }

        update() {
            this.fsm.update();
            const dir = THREE.MathUtils.radToDeg(this.gameObject.transform.rotation.y);
            this.helper.setState(`${this.fsm.state}:${dir.toFixed(0)}`)
        }
    }

    class CameraInfo extends Component {
        constructor(gameObject) {
            super(gameObject);
            this.projScreenMatrix = new THREE.Matrix4();
            this.frustum = new THREE.Frustum();
        }

        update() {
            const {camera} = globals;
            this.projScreenMatrix.multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse
            );
            this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
        }
    }


    function init() {
        const loadingElem = document.querySelector('#loading');
        loadingElem.style.display = 'none';

        prepModelAndAnimations();

        {
            const gameObject = gameObjectManager.createGameObject(camera, 'camera');
            globals.cameraInfo = gameObject.addComponent(CameraInfo)
        }

        {
            const gameObject = gameObjectManager.createGameObject(scene, 'player');
            globals.player = gameObject.addComponent(Player);
            globals.congaLine = [gameObject];
        }
        const animalModelItems = [
            'pig',
            'cow',
            'llama',
            'pug',
            'sheep',
            'zebra',
            'horse'
        ];
        animalModelItems.forEach((name, ndx) => {
            const gameObject = gameObjectManager.createGameObject(scene, name);
            gameObject.addComponent(Animal, models[name]);
            gameObject.transform.position.x = (ndx + 1) * 5;
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
        globals.time = now * 0.001;
        globals.deltaTime = Math.min(globals.time - then, 1 / 20);
        then = globals.time;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        gameObjectManager.update();
        inputManager.update();

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}