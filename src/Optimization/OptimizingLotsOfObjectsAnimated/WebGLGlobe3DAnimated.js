import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import TWEEN from 'three/addons/libs/tween.module.js'

export default function WebGLGlobe3DAnimated() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const tweenManager = new TweenManager();

    // 카메라 설정
    const fov = 60;
    const aspect = 2;
    const near = 0.1;
    const far = 10;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2.5;

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
        const texture = loader.load('/data/world.jpg', render);
        texture.colorSpace = THREE.SRGBColorSpace;
        const geometry = new THREE.SphereGeometry(1, 64, 32);
        const material = new THREE.MeshBasicMaterial({map: texture});
        scene.add(new THREE.Mesh(geometry, material));

    }

    async function loadFile( url ) {
        const req = await fetch( url );
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

    function dataMissingInAnySet(fileInfos, latNdx, lonNdx) {
        for (const fileInfo of fileInfos) {
            if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
                return true;
            }
        }
        return false;
    }

    function makeBoxes(file, hueRange, fileInfos) {

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

                if (dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
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

                const hue = THREE.MathUtils.lerp(...hueRange, amount);
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

        return BufferGeometryUtils.mergeGeometries(
            geometries, false);
    }


    async function loadData(info) {
        const text = await loadFile(info.url);
        info.file = parseData(text);
    }

    async function loadAll() {
        const fileInfos = [
            {
                name: 'men',
                hueRange: [0.7, 0.3],
                url: 'https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc'
            },
            {
                name: 'women',
                hueRange: [0.9, 1.1],
                url: 'https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc'
            }
        ];

        await Promise.all(fileInfos.map(loadData));


        function mapValues(data, fn) {
            return data.map((row, rowNdx) => {
                return row.map((value, colNdx) => {
                    return fn(value, rowNdx, colNdx);
                })
            })
        }

        function makeDiffFile(baseFile, otherFile, compareFn) {
            let min;
            let max;

            const baseData = baseFile.data;
            const otherData = otherFile.data;
            const data = mapValues(baseData, (base, rowNdx, colNdx) => {
                const other = otherData[rowNdx][colNdx];
                if (base === undefined || other === undefined) {
                    return undefined;
                }
                const value = compareFn(base, other);
                min = Math.min(min === undefined ? value : min, value);
                max = Math.max(max === undefined ? value : max, value);
                return value;
            });

            return {...baseFile, min, max, data}
        }

        {
            const menInfo = fileInfos[0];
            const womenInfo = fileInfos[1];
            const menFile = menInfo.file;
            const womenFile = womenInfo.file;

            function amountGreaterThan(a, b) {
                return Math.max(a - b, 0);
            }

            fileInfos.push({
                name: '>50% men',
                hueRange: [0.6, 1.1],
                file: makeDiffFile(menFile, womenFile, (men, women) => {
                    return amountGreaterThan(men, women);
                }),
            });

            fileInfos.push({
                name: '>50% women',
                hueRange: [0.0, 0.4],
                file: makeDiffFile(womenFile, menFile, (women, men) => {
                    return amountGreaterThan(women, men);
                })
            });
        }

        const geometries = fileInfos.map((info) => {
            return makeBoxes(info.file, info.hueRange, fileInfos);
        })

        const baseGeometry = geometries[0];
        baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
            const attribute = geometry.getAttribute('position');
            const name = `target${ndx}`;

            attribute.name = name;
            return attribute;
        });
        baseGeometry.morphAttributes.color = geometries.map((geometry, ndx) => {
            const attribute = geometry.getAttribute('color');
            const name = `target${ndx}`;
            attribute.name = name;
            return attribute;
        })

        const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
        });
        const mesh = new THREE.Mesh(baseGeometry, material);
        scene.add(mesh);


        function showFileInfo(fileInfos, fileInfo) {
            const targets = {};
            fileInfos.forEach((info, i) => {
                const visible = fileInfo === info;
                info.elem.className = visible ? 'selected' : '';
                targets[i] = visible ? 1 : 0;
            });
            const durationInMs = 1000;
            tweenManager.createTween(mesh.morphTargetInfluences)
                .to(targets, durationInMs)
                .start();
            requestRenderIfNotRequested();
        }

        const uiElem = document.querySelector('#ui');
        fileInfos.forEach((info) => {
            const div = document.createElement('div');
            info.elem = div;
            div.textContent = info.name;
            uiElem.appendChild(div);

            function show() {
                showFileInfo(fileInfos, info);
            }

            div.addEventListener('mouseover', show);
            div.addEventListener('touchstart', show);
        });
        showFileInfo(fileInfos, fileInfos[0]);
    }

    loadAll();

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

        if (tweenManager.update()) {

            requestRenderIfNotRequested();

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

class TweenManager {
    constructor() {
        this.numTweensRunning = 0;
    }

    _handleComplete() {
        --this.numTweensRunning;
        console.assert(this.numTweensRunning >= 0);
    }

    createTween(targetObject) {
        const self = this;
        ++this.numTweensRunning;
        let userCompleteFn = () => {
        };

        const tween = new TWEEN.Tween(targetObject).onComplete(function (...args) {
            self._handleComplete();
            userCompleteFn.call(this, ...args);
        });

        tween.onComplete = (fn) => {
            userCompleteFn = fn;
            return tween;
        };
        return tween;
    }

    update() {
        TWEEN.update();
        return this.numTweensRunning > 0;
    }
}