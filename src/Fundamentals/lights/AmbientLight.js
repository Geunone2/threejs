import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export default function AmbientLight() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 10, 20);

    const scene = new THREE.Scene();

    // OrbitControls 추가
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    // 텍스처 추가
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('/public/examples/checker.png');
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
    cube.position.set(cubeSize + 1, cubeSize + 4, 0);
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


    // 조명(AmbientLight) 추가

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);


    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 5, 0.01);


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

    // 큐브 시간 기준으로 X & Y축으로 회전
    function render(time) {
        time *= 0.0005;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cube.rotation.x = time;
        cube.rotation.y = time;
        sphere.rotation.x = time;
        sphere.rotation.y = time;

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