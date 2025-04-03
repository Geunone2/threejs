import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';


export default function CubeWrapping() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 16);

    camera.position.z = 8;

    // 씬 생성
    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(5, 2, 5);

    // 텍스처 설정
    const loader = new THREE.TextureLoader();
    const texture = loader.load(`/mip-low-res-enlarged.png`);
    texture.colorSpace = THREE.SRGBColorSpace;

    // 텍스처 래핑 설정
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const timesToRepeatHorizontally = 4;
    const timesToRepeatVertically = 2;
    texture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);

    // 오프셋 설정
    const xOffset = .5;
    const yOffset = .25;
    texture.offset.set(xOffset, yOffset);

    // 반복 설정
    texture.center.set(.5, .5);
    texture.rotation = THREE.MathUtils.degToRad(45);

    // 래핑 모드
    const wrapModes = {
        "ClampToEdgeWrapping": THREE.ClampToEdgeWrapping,
        "RepeatWrapping": THREE.RepeatWrapping,
        "MirroredRepeatWrapping": THREE.MirroredRepeatWrapping,
    };

    function updateTexture() {
        texture.needsUpdate = true;
    }

    // GUI 만들기
    const gui = new GUI();
    gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
        .name('texture.wrapS')
        .onChange(updateTexture);
    gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
        .name('texture.wrapT')
        .onChange(updateTexture);
    gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
    gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
    gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
    gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.x');
    gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
    gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.x');
    gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
        .name('texture.rotation')


    // 머터리얼 설정
    const material = new THREE.MeshBasicMaterial({
        map: texture,
    })

    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);


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

        cube.rotation.x = time;
        cube.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }


    requestAnimationFrame(render);
}

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

class StringToNumberHelper {
    constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
    }

    get value() {
        return this.obj[this.prop];
    }

    set value(v) {
        this.obj[this.prop] = parseFloat(v);
    }
}
