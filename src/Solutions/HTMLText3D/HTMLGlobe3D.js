import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from "three/addons/libs/lil-gui.module.min.js"

export default function HTMLGlobe3D() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 60;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 10;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2.5;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 4;
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#246');

    {

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejs.org/manual/examples/resources/data/world/country-outlines-4k.png', render);
        const geometry = new THREE.SphereGeometry(1, 64, 32);
        const material = new THREE.MeshBasicMaterial({map: texture});
        scene.add(new THREE.Mesh(geometry, material));

    }

    async function loadJSON(url) {
        const req = await fetch(url);

        return req.json();
    }

    let countryInfos;

    async function loadCountryData() {

        countryInfos = await loadJSON('https://threejs.org/manual/examples/resources/data/world/country-info.json');

        const lonFudge = Math.PI * 1.5;
        const latFudge = Math.PI;

        const lonHelper = new THREE.Object3D();
        const latHelper = new THREE.Object3D();

        lonHelper.add(latHelper);

        const positionHelper = new THREE.Object3D();

        positionHelper.position.z = 1;

        latHelper.add(positionHelper);

        const labelParentElem = document.querySelector('#labels');
        for (const countryInfo of countryInfos) {
            const {lat, lon, min, max, name} = countryInfo;

            lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
            latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;

            positionHelper.updateWorldMatrix(true, false);
            const position = new THREE.Vector3();
            positionHelper.getWorldPosition(position);
            countryInfo.position = position;

            const width = max[0] - min[0];
            const height = max[1] - min[1];
            const area = width * height;
            countryInfo.area = area;

            const elem = document.createElement('div');
            elem.textContent = name;
            labelParentElem.appendChild(elem);
            countryInfo.elem = elem;
        }
        requestRenderIfNotRequested();
    }

    loadCountryData();

    const tempV = new THREE.Vector3();
    const cameraToPoint = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3();

    const settings = {
        minArea: 20,
        minVisibleDot: -0.2,
    };
    const gui = new GUI({width: 300});
    gui.add(settings, 'minArea', 0, 50).onChange(requestRenderIfNotRequested);
    gui.add(settings, 'minVisibleDot', -1, 1, 0.01).onChange(requestRenderIfNotRequested);

    function updateLabels() {
        if (!countryInfos) {
            return;
        }

        const large = settings.minArea * settings.minArea;
        normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
        camera.getWorldPosition(cameraPosition);

        for (const countryInfo of countryInfos) {

            const {position, elem, area} = countryInfo;

            if (area < large) {
                elem.style.display = 'none';
                continue;
            }

            tempV.copy(position);
            tempV.applyMatrix3(normalMatrix);

            cameraToPoint.copy(position);
            cameraToPoint.applyMatrix4(camera.matrixWorldInverse).normalize();

            const dot = tempV.dot(cameraToPoint);


            if (dot > settings.minVisibleDot) {
                elem.style.display = 'none';
                continue;
            }

            elem.style.display = '';

            tempV.copy(position);
            tempV.project(camera);

            const x = (tempV.x * .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

            elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

            elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
        }
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

    let renderRequested = false;

    function render() {
        renderRequested = undefined;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        controls.update();
        updateLabels();
        renderer.render(scene, camera);
    }

    render();

    function requestRenderIfNotRequested() {
        if (!renderRequested) {
            renderRequested = true;
            requestAnimationFrame(render);
        }
    }

    controls.addEventListener('change', requestRenderIfNotRequested);
    window.addEventListener('resize', requestRenderIfNotRequested);
}