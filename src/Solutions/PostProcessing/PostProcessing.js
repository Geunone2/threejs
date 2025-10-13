import * as THREE from "three";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {BloomPass} from "three/examples/jsm/postprocessing/BloomPass.js";
import {FilmPass} from "three/examples/jsm/postprocessing/FilmPass.js";
import {OutputPass} from "three/examples/jsm/postprocessing/OutputPass.js";
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass.js";


export default function PostProcessing() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

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

        return cube;
    }

    const cubes = [makeInstance(geometry, 0x44aa88, 0), makeInstance(geometry, 0x8844aa, -2), makeInstance(geometry, 0xaa8844, 2),];

    // 컴포즈 생성
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // 블룸 효과
    const bloomPass = new BloomPass(1,    // strength
        25, // kernel size
        4,     // sigma ?
        256          // blur render target resolution
    );
    composer.addPass(bloomPass);

    // 필름 효과
    const filmPass = new FilmPass(0.5, // intensity
        false, // grayscale
    )
    composer.addPass(filmPass);

    // 출력 패스
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const colorShader = {
        uniforms: {
            tDiffuse: {value: null},
            color: {value: new THREE.Color(0x88CCFF)},
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1);
            }`,
        fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec3 color;
        void main() {
            vec4 previousPassColor = texture2D( tDiffuse, vUv );
            gl_FragColor = vec4(
            previousPassColor.rgb * color,
            previousPassColor.a
            );
        }`
    }

    const colorPass = new ShaderPass(colorShader);
    composer.addPass(colorPass);

    const gui = new GUI();
    // {
    //     const folder = gui.addFolder('BloomPass');
    //     folder.add(bloomPass.combineUniforms.strength, 'value', 0, 2).name('strength');
    //     folder.open();
    // }
    //
    // {
    //     const folder = gui.addFolder('FilmPass');
    //     folder.add(filmPass.uniforms.grayscale, 'value').name('grayscale');
    //     folder.add(filmPass.uniforms.intensity, 'value', 0, 1).name('intensity');
    //     folder.open();
    // }
    gui.add(colorPass.uniforms.color.value, 'r', 0, 4).name('red');
    gui.add(colorPass.uniforms.color.value, 'g', 0, 4).name('green');
    gui.add(colorPass.uniforms.color.value, 'b', 0, 4).name('blue');


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
            composer.setSize(canvas.width, canvas.height);
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = now * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        })

        composer.render(deltaTime);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}