import * as THREE from 'three'
import {OrbitControls} from "three/addons/controls/OrbitControls.js"
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export default function TwoPerspectiveCamera() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const view1Elem = document.querySelector('#view1');
    const view2Elem = document.querySelector('#view2');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라 1번
    const camera1 = new THREE.PerspectiveCamera(
        45,
        2,
        0.1,
        100
    );
    camera1.position.set(0, 10, 20);

    // 카메라 2번
    const camera2 = new THREE.PerspectiveCamera(
        60,
        2,
        0.1,
        500
    );
    camera2.position.set(40, 10, 30);
    camera2.lookAt(0, 5, 0);

    const scene = new THREE.Scene();

    // OrbitControls 추가
    // camera 1번
    const controls = new OrbitControls(camera1, view1Elem);
    controls.target.set(0, 5, 0);
    controls.update();

    // camera 2번
    const controls2 = new OrbitControls(camera2, view2Elem);
    controls2.target.set(0, 5, 0);
    controls2.update();


    // 텍스처 추가
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('/examples/checker.png');
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
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);

    // 큐브 객체 생성
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMet = new THREE.MeshPhongMaterial({color: '#8AC'});
    const cube = new THREE.Mesh(cubeGeo, cubeMet);
    cube.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(cube);


    // 구체 객체 생성
    const sphereRadius = 3;
    const sphereWidthDvisions = 32;
    const sphereHeightDvisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDvisions, sphereHeightDvisions);
    const sphereMet = new THREE.MeshPhongMaterial({color: '#8AC'});
    const sphere = new THREE.Mesh(sphereGeo, sphereMet);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphere);

    // 조명(PointLight) 추가
    const color = 0xFFFFFF;
    const intensity = 150;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 14, 0);
    scene.add(light);

    // CameraHelper 추가
    const cameraHelper = new THREE.CameraHelper(camera1);
    scene.add(cameraHelper);

    const gui = new GUI();
    gui.add(camera1, 'fov', 1, 180);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera1, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near')
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far')


    // Scissor 기능 추가
    function setScissorForElement(elem) {
        const canvasRect = canvas.getBoundingClientRect();
        const elemRect = elem.getBoundingClientRect();

        // compute a canvas relative rectangle
        const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
        const left = Math.max(0, elemRect.left - canvasRect.left);
        const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
        const top = Math.max(0, elemRect.top - canvasRect.top);

        const width = Math.min(canvasRect.width, right - left);
        const height = Math.min(canvas.height, bottom - top);

        // setup the scissor to only render to that part of the canvas
        const positiveYUpBottom = canvasRect.height - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        // return the aspect
        return width / height;
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

    function render() {
        resizeRendererToDisplaySize(renderer);

        // turn on the Scissor
        renderer.setScissorTest(true);

        // 장면 백그라운드 기본값 설정
        scene.background = new THREE.Color(0x000000);

        // render Camera 1
        {
            const aspect = setScissorForElement(view1Elem);

            // adjust the camera for this aspect
            camera1.aspect = aspect;
            camera1.updateProjectionMatrix();
            cameraHelper.update();

            // don't draw the camera helper in the original view
            cameraHelper.visible = false;

            scene.background.set(0x000000);

            // render
            renderer.render(scene, camera1);
        }


        // render Camera 2
        {
            const aspect = setScissorForElement(view2Elem);

            // adjust the camera for this aspect
            camera2.aspect = aspect;
            camera2.updateProjectionMatrix();

            // draw the camera helper in the 2 view
            cameraHelper.visible = true;

            scene.background.set(0x000040);
            renderer.render(scene, camera2);
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
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