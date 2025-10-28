import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export default function SpriteHumanCanvas() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 50);
    camera.position.set(0, 2, 5);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 2, 0);
    controls.update();


    // 씬 생성
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    function addLight(position) {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...position);
        scene.add(light);
        scene.add(light.target);
    }

    addLight([-3, 1, 1]);
    addLight([2, 1, .5]);

    const ctx = document.createElement('canvas').getContext('2d');

    function makeLabelCanvas(baseWidth, size, name) {
        const borderSize = 2;
        const font = `${size}px bold sans-serif`;

        ctx.font = font;
        const textWidth = ctx.measureText(name).width;

        const doubleBorderSize = borderSize * 2;
        const width = baseWidth + doubleBorderSize;
        const height = size + doubleBorderSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;

        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, width, height);

        const scaleFactor = Math.min(1, baseWidth / textWidth);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, 1);

        ctx.fillStyle = 'white';
        ctx.fillText(name, borderSize, borderSize);

        return ctx.canvas;
    }

    const bodyRadiusTop = .4;
    const bodyRadiusBottom = .2;
    const bodyHeight = 2;
    const bodyRadialSegments = 6;
    const bodyGeometry = new THREE.CylinderGeometry(
        bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments
    );

    const headRadius = bodyRadiusTop * 0.8;
    const headLonSegments = 12;
    const headLatSegments = 5;
    const headGeometry = new THREE.SphereGeometry(
        headRadius, headLonSegments, headLatSegments
    );

    const forceTextureInitialization = function () {
        const material = new THREE.MeshBasicMaterial();
        const geometry = new THREE.PlaneGeometry();
        const scene = new THREE.Scene();
        scene.add(new THREE.Mesh(geometry, material));
        const camera = new THREE.Camera();

        return function forceTextureInitialization(texture) {
            material.map = texture;
            renderer.render(scene, camera);
        }
    }();

    function makePerson(x, labelWidth, size, name, color) {
        const canvas = makeLabelCanvas(labelWidth, size, name);
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        forceTextureInitialization(texture);

        const labelMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });

        const bodyMaterial = new THREE.MeshPhongMaterial({
            color,
            flatShading: true,
        });

        const root = new THREE.Object3D();
        root.position.x = x;

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        root.add(body);
        body.position.y = bodyHeight / 2;

        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        root.add(head);
        head.position.y = bodyHeight + headRadius * 1.1;

        const labelBaseScale = 0.01;

        const label = new THREE.Sprite(labelMaterial);
        root.add(label);
        label.position.y = head.position.y + headRadius + size * labelBaseScale;

        label.scale.x = canvas.width * labelBaseScale;
        label.scale.y = canvas.height * labelBaseScale;

        scene.add(root);
        return root;
    }

    makePerson(-3, 150, 32, "Purple People Eater", 'purple');
    makePerson(-0, 150, 32, "Green People Eater", 'green');
    makePerson(3, 150, 32, "Red People Eater", 'red');

    const texture = new THREE.CanvasTexture(ctx.canvas);


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
        texture.needsUpdate = true;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}