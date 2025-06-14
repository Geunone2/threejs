import * as THREE from "three";

export default function MultipleScene() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    function makeScene(elem) {
        const scene = new THREE.Scene;
        scene.background = new THREE.Color(0xffffff);

        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 5;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;
        camera.position.set(0, 1, 2);
        camera.lookAt(0, 0, 0);

        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            scene.add(light);
        }

        return {scene, camera, elem};
    }

    function setUpScene1() {
        const sceneInfo = makeScene(document.querySelector('#box'));
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 'red'});
        const mesh = new THREE.Mesh(geometry, material);
        sceneInfo.scene.add(mesh);
        sceneInfo.mesh = mesh;
        return sceneInfo;
    }

    function setUpScene2() {
        const sceneInfo = makeScene(document.querySelector('#pyramid'));
        const radius = .8;
        const widthSegments = 4;
        const heightSegments = 2;
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.MeshPhongMaterial({color: 'blue', flatShading: true});
        const mesh = new THREE.Mesh(geometry, material);
        sceneInfo.scene.add(mesh);
        sceneInfo.mesh = mesh;
        return sceneInfo;
    }

    const sceneInfo1 = setUpScene1();
    const sceneInfo2 = setUpScene2();

    function renderSceneInfo(sceneInfo) {
        const {scene, camera, elem} = sceneInfo;

        const {left, right, top, bottom, width, height} = elem.getBoundingClientRect();

        const isOffscreen =
            bottom < 0 ||
            top > renderer.domElement.clientHeight ||
            right < 0 ||
            left > renderer.domElement.clientWidth;

        if (isOffscreen) {
            return;
        }

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
        renderer.setScissor(left, positiveYUpBottom, width, height);
        renderer.setViewport(left, positiveYUpBottom, width, height);

        renderer.render(scene, camera)
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

    function render(time) {
        time *= 0.001;

        resizeRendererToDisplaySize(renderer);

        renderer.setScissorTest(false);
        renderer.clear(true, true);
        renderer.setScissorTest(true);

        sceneInfo1.mesh.rotation.y = time * .1;
        sceneInfo2.mesh.rotation.y = time * .1;

        renderSceneInfo(sceneInfo1);
        renderSceneInfo(sceneInfo2);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

