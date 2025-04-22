import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export default function SpotLightShadow() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})
    renderer.shadowMap.enabled = true;

    // 카메라
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 10, 20);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    // OrbitControls 추가
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    // 텍스처 추가
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('examples/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    // 텍스처 XY 평면 -> XZ 평면으로 회전
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);

    // 큐브 객체 생성
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMet = new THREE.MeshPhongMaterial({color: '#8AC'});
    const cube = new THREE.Mesh(cubeGeo, cubeMet);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(cube);


    // 구체 객체 생성
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMet = new THREE.MeshPhongMaterial({color: '#CA8'});
    const sphere = new THREE.Mesh(sphereGeo, sphereMet);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphere);


    // 조명(SpotLight) 추가
    const color = 0xFFFFFF;
    const intensity = 100;
    const light = new THREE.SpotLight(color, intensity);
    light.castShadow = true;
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 200, 0.01);

    // 도 단위 헬퍼
    gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    gui.add(light, 'penumbra', 0, 1, 0.01);

    {
        const folder = gui.addFolder('Shadow Camera');
        folder.open();
        const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
        folder
            .add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
        folder
            .add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
    }

    // SpotLightHelper 추가
    const helper = new THREE.SpotLightHelper(light);
    scene.add(helper);

    // cameraHelper 추가
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);


    // helper 위치 업데이트
    function makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
        folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
        folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
        folder.open();
    }

    function updateLight() {
        light.target.updateMatrixWorld();
        helper.update();
    }

    function updateCamera() {
        light.target.updateMatrixWorld();
        helper.update();
        light.shadow.camera.updateProjectionMatrix();
        cameraHelper.update();
    }

    updateCamera();

    makeXYZGUI(gui, light.position, 'position', updateLight);
    makeXYZGUI(gui, light.target.position, 'target', updateLight);

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

    // 큐브 시간 기준으로 X & Y 축으로 회전
    function render() {

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        // helper.update();


        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}


// Hex 색상 조정 헬퍼
class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return `#${this.object[this.prop].getHexString()}`
    }

    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

// near & far 설정을 돕는 MinMaxGUIHelper
class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }

    get min() {
        return this.obj[this.minProp];
    }

    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }

    get max() {
        return this.obj[this.maxProp]
    }

    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;
    }
}

// 도 단위 조정 헬퍼
class DegRadHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }

    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }

    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
}