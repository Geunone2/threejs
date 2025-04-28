import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

export default function RenderingOnDemand2() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const gui = new GUI();
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    let renderRequested = false;

    // 카메라
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

    // OrbitControls 설정
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
    controls.addEventListener("change", requestRenderIfNotRequested);
    controls.enableDamping = true;
    window.addEventListener('resize', requestRenderIfNotRequested);


    // 씬
    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // 박스 기하 구조; BoxGeometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        const folder = gui.addFolder(`Cube${x}`);
        folder.addColor(new ColorGUIHelper(material, 'color'), 'value')
            .name('color')
            .onChange(requestRenderIfNotRequested);
        folder.add(cube.scale, 'x', .1, 1.5)
            .name('scale x')
            .onChange(requestRenderIfNotRequested);

        folder.open();

        return cube;
    }

    makeInstance(geometry, 0x44aa88, 0);
    makeInstance(geometry, 0x8844aa, -2);
    makeInstance(geometry, 0xaa8844, 2);

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
        renderRequested = false;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
    }

    render();

    function requestRenderIfNotRequested() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(render);
        }
    }
}

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