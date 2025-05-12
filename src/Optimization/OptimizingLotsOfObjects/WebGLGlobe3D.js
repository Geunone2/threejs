import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export default function WebGLGlobe3D() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 요청 시 마다 렌더링
    let renderRequested = false;

    // 카메라 설정
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

    // OrbitControls 설정
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 4;
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    // 텍스처 설정
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('/data/world.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;
        const geometry = new THREE.SphereGeometry(1, 64, 32);
        const material = new THREE.MeshBasicMaterial({map: texture});
        scene.add(new THREE.Mesh(geometry, material));
    }

    async function loadFile(url) {
        const req = await fetch(url);
        return req.text();
    }

    function parseData(text) {
        const data = [];
        const settings = {data};
        let min, max;

        text.split('\n').forEach((line) => {
            const parts = line.trim().split(/\s+/);

            if (parts.length === 2) {
                settings[parts[0]] = parseFloat(parts[1]);
            } else if (parts.length > 2) {
                const values = parts.map((v) => {
                    const value = parseFloat(v);
                    if (value === settings.NODATA_value) {
                        return undefined;
                    }
                    max = Math.max(max === undefined ? value : max, value);
                    min = Math.min(min === undefined ? value : min, value);
                    return value;
                })
                data.push(values);
            }
        });

        return Object.assign(settings, {min, max})
    }


    function addBoxes(file) {

        const {min, max, data} = file;
        const range = max - min;

        const lonHelper = new THREE.Object3D();
        scene.add(lonHelper);

        const latHelper = new THREE.Object3D();
        lonHelper.add(latHelper);

        const positionHelper = new THREE.Object3D();
        positionHelper.position.z = 1;
        latHelper.add(positionHelper);

        const originHelper = new THREE.Object3D();
        originHelper.position.z = 0.5;
        positionHelper.add(originHelper);

        const color = new THREE.Color();

        const lonFudge = Math.PI * .5;
        const latFudge = Math.PI * -0.135;
        const geometries = [];
        data.forEach((row, latNdx) => {

            row.forEach((value, lonNdx) => {

                if (value === undefined) {

                    return;

                }

                const amount = (value - min) / range;
                const boxWidth = 1;
                const boxHeight = 1;
                const boxDepth = 1;
                const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

                lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
                latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

                positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
                originHelper.updateWorldMatrix(true, false);
                geometry.applyMatrix4(originHelper.matrixWorld);

                const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
                const saturation = 1;
                const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
                color.setHSL(hue, saturation, lightness);
                const rgb = color.toArray().map(v => v * 255);

                const numVerts = geometry.getAttribute('position').count;
                const itemSize = 3;
                const colors = new Uint8Array(itemSize * numVerts);

                colors.forEach((v, ndx) => {
                    colors[ndx] = rgb[ndx % 3];
                })

                const normalized = true;
                const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized);
                geometry.setAttribute('color', colorAttrib);

                geometries.push(geometry);

            });
        });
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);
        const materials = new THREE.MeshBasicMaterial({
            vertexColors: true,
        })
        const mesh = new THREE.Mesh(mergedGeometry, materials);
        scene.add(mesh);
    }

    loadFile('https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
        .then(parseData)
        .then(addBoxes)
        .then(render)

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
        renderRequested = undefined;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        controls.update();
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

