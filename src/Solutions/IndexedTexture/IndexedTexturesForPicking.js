import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from "three/addons/libs/lil-gui.module.min.js"

export default function IndexedTexturesForPicking() {

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

    const pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0);

    const maxNumCountries = 512;
    const paletteTextureWidth = maxNumCountries;
    const paletteTextureHeight = 1;
    const palette = new Uint8Array(paletteTextureWidth * 4);
    const paletteTexture = new THREE.DataTexture(palette, paletteTextureWidth, paletteTextureHeight);
    paletteTexture.minFilter = THREE.NearestFilter;
    paletteTexture.magFilter = THREE.NearestFilter;
    paletteTexture.colorSpace = THREE.SRGBColorSpace;
    for (let i = 1; i < palette.length; ++i) {
        palette[i] = Math.random() * 256;
    }

    palette.set([100, 200, 255, 255], 0);
    paletteTexture.needsUpdate = true;

    {
        const loader = new THREE.TextureLoader();
        const geometry = new THREE.SphereGeometry(1, 64, 32);

        const indexTexture = loader.load('https://threejs.org/manual/examples/resources/data/world/country-index-texture.png', render);
        indexTexture.minFilter = THREE.NearestFilter;
        indexTexture.magFilter = THREE.NearestFilter;

        const pickingMaterial = new THREE.MeshBasicMaterial({map: indexTexture});
        pickingScene.add(new THREE.Mesh(geometry, pickingMaterial));

        const fragmentShaderReplacements = [
            {
                from: '#include <common>',
                to: `
          #include <common>
          uniform sampler2D indexTexture;
          uniform sampler2D paletteTexture;
          uniform float paletteTextureWidth;
        `,
            },
            {
                from: '#include <color_fragment>',
                to: `
          #include <color_fragment>
          {
            vec4 indexColor = texture2D(indexTexture, vMapUv);
            float index = indexColor.r * 255.0 + indexColor.g * 255.0 * 256.0;
            vec2 paletteUV = vec2((index + 0.5) / paletteTextureWidth, 0.5);
            vec4 paletteColor = texture2D(paletteTexture, paletteUV);
            // diffuseColor.rgb += paletteColor.rgb;   // white outlines
            diffuseColor.rgb = paletteColor.rgb - diffuseColor.rgb;  // black outlines
          }
        `,
            },
        ];

        const texture = loader.load('https://threejs.org/manual/examples/resources/data/world/country-outlines-4k.png', render);
        const material = new THREE.MeshBasicMaterial({map: texture});
        material.onBeforeCompile = function (shader) {

            fragmentShaderReplacements.forEach((rep) => {

                shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);

            });
            shader.uniforms.paletteTexture = {value: paletteTexture};
            shader.uniforms.indexTexture = {value: indexTexture};
            shader.uniforms.paletteTextureWidth = {value: paletteTextureWidth};

        };
        scene.add(new THREE.Mesh(geometry, material));
    }

    const tempColor = new THREE.Color();

    function get255BasedColor(color) {
        tempColor.set(color);
        const base = tempColor.toArray().map(v => v * 255);
        base.push(255);
        return base;
    }

    const selectedColor = get255BasedColor('red');
    const unselectedColor = get255BasedColor('#444');
    const oceanColor = get255BasedColor('rgb(100, 200, 255)');
    resetPalette();

    function setPaletteColor(index, color) {
        palette.set(color, index * 4);
    }

    function resetPalette() {
        for (let i = 0; i < maxNumCountries; ++i) {
            setPaletteColor(i, unselectedColor);
        }

        setPaletteColor(0, oceanColor);
        paletteTexture.needsUpdate = true;
    }

    async function loadJSON(url) {
        const req = await fetch(url);

        return req.json();
    }

    let numCountriesSelected = 0;
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
            const {position, elem, area, selected} = countryInfo;
            const largeEnough = area >= large;
            const show = selected || (numCountriesSelected === 0 && largeEnough);

            if (!show) {
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

    class GPUPickHelper {
        constructor() {
            this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
            this.pixelBuffer = new Uint8Array(4);
        }

        pick(cssPosition, scene, camera) {
            const {pickingTexture, pixelBuffer} = this;

            const pixelRatio = renderer.getPixelRatio();
            camera.setViewOffset(
                renderer.getContext().drawingBufferWidth,
                renderer.getContext().drawingBufferHeight,
                cssPosition.x * pixelRatio | 0,
                cssPosition.y * pixelRatio | 0,
                1,
                1,
            );

            renderer.setRenderTarget(pickingTexture);
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);

            camera.clearViewOffset();
            renderer.readRenderTargetPixels(
                pickingTexture,
                0,
                0,
                1,
                1,
                pixelBuffer,
            )

            const id =
                (pixelBuffer[0] << 0) |
                (pixelBuffer[1] << 8) |
                (pixelBuffer[2] << 16);

            return id;
        }
    }

    const pickHelper = new GPUPickHelper();

    const maxClickTimeMs = 200;
    const maxMoveDeltaSq = 5 * 5;
    const startPosition = {};

    let startTimeMs;

    function recordStartTimeAndPosition(event) {
        startTimeMs = performance.now();
        const pos = getCanvasRelativePosition(event);
        startPosition.x = pos.x;
        startPosition.y = pos.y;
    }

    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height
        }
    }

    function pickCountry(event) {
        if (!countryInfos) {
            return;
        }

        const clickTimeMs = performance.now() - startTimeMs;
        if (clickTimeMs > maxClickTimeMs) {
            return;
        }

        const position = getCanvasRelativePosition(event);
        const moveDeltaSq = (startPosition.x - position.x) ** 2 + (startPosition.y - position.y) ** 2;
        if (moveDeltaSq > maxMoveDeltaSq) {
            return;
        }

        const id = pickHelper.pick(position, pickingScene, camera);

        if (id > 0) {
            const countryInfo = countryInfos[id - 1];
            const selected = !countryInfo.selected;

            if (selected && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                unselectAllCountries();
            }
            numCountriesSelected += selected ? 1 : -1;
            countryInfo.selected = selected;
            setPaletteColor(id, selected ? selectedColor : unselectedColor);
            paletteTexture.needsUpdate = true;
        } else if (numCountriesSelected) {
            unselectAllCountries();
        }
        requestRenderIfNotRequested();
    }

    function unselectAllCountries() {
        numCountriesSelected = 0;
        countryInfos.forEach(countryInfo => {
            countryInfo.selected = false;
        });
        resetPalette();
    }

    canvas.addEventListener('pointerdown', recordStartTimeAndPosition);
    canvas.addEventListener('pointerup', pickCountry);

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