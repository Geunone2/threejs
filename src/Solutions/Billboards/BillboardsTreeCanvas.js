import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export default function BillboardsTreeCanvas() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 5);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 2, 0);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
    controls.update();


    // 씬 생성
    const scene = new THREE.Scene();

    function addLight(position) {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...position);
        scene.add(light);
        scene.add(light.target);
    }

    addLight([-3, 1, 1]);
    addLight([2, 1, .5]);

    const trunkRadius = .2;
    const trunkHeight = 1;
    const trunkRadialSegments = 12;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, trunkRadialSegments);

    const topRadius = trunkRadius * 4;
    const topHeight = trunkHeight * 2;
    const topSegments = 12;
    const topGeometry = new THREE.ConeGeometry(topRadius, topHeight, topSegments);

    const trunkMaterial = new THREE.MeshPhongMaterial({color: 'brown'});
    const topMaterial = new THREE.MeshPhongMaterial({color: 'green'});

    function makeTree(x, z) {

        const root = new THREE.Object3D();
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        root.add(trunk);

        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = trunkHeight + topHeight / 2;
        root.add(top);

        root.position.set(x, 0, z);
        scene.add(root);

        return root;
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {

        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

        camera.position.copy(boxCenter);
        camera.position.z += distance;

        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

    }

    function makeSpriteTexture(textureSize, obj) {

        const rt = new THREE.WebGLRenderTarget(textureSize, textureSize);

        const aspect = 1;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        scene.add(obj);

        const box = new THREE.Box3().setFromObject(obj);

        const boxSize = box.getSize(new THREE.Vector3());
        const boxCenter = box.getCenter(new THREE.Vector3());

        const fudge = 1.1;
        const size = Math.max(...boxSize.toArray()) * fudge;
        frameArea(size, size, boxCenter, camera);

        renderer.autoClear = false;
        renderer.setRenderTarget(rt);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.autoClear = true;

        scene.remove(obj);

        return {
            offset: boxCenter.multiplyScalar(fudge),
            scale: size,
            texture: rt.texture,
        };

    }

    const tree = makeTree(0, 0);
    const facadeSize = 64;
    const treeSpriteInfo = makeSpriteTexture(facadeSize, tree);

    function makeSprite(spriteInfo, x, z) {

        const {texture, offset, scale} = spriteInfo;
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });
        const sprite = new THREE.Sprite(mat);
        scene.add(sprite);
        sprite.position.set(
            offset.x + x,
            offset.y,
            offset.z + z);
        sprite.scale.set(scale, scale, scale);
    }

    for (let z = -50; z <= 50; z += 10) {
        for (let x = -50; x <= 50; x += 10) {
            makeSprite(treeSpriteInfo, x, z);
        }
    }

    scene.background = new THREE.Color('lightblue');

    // 땅 생성
    {
        const size = 400;
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshPhongMaterial({color: 'gray'});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI * -0.5;
        scene.add(mesh);
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