import * as THREE from "three";
import {TrackballControls} from 'three/addons/controls/TrackballControls.js'

export default function MultipleScene() {

    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas, alpha: true});

    renderer.setScissorTest(true);

    function makeScene(elem) {
        const scene = new THREE.Scene;

        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 5;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 1, 2);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        const controls = new TrackballControls(camera, elem);
        controls.noZoom = true;
        controls.noPan = true;

        {
            const color = 0xFFFFFF;
            const intensity = 3;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            camera.add(light);
        }

        return {scene, camera, controls};
    }

    const sceneElements = [];

    function addScene(elem, fn) {
        const ctx = document.createElement('canvas').getContext('2d');
        elem.appendChild(ctx.canvas);
        sceneElements.push({elem, ctx, fn});
    }

    const sceneInitFunctionsByName = {
        'box': (elem) => {
            const {scene, camera, controls} = makeScene(elem);
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({color: 'red'})
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            return (time, rect) => {
                mesh.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },

        'pyramid': (elem) => {
            const {scene, camera, controls} = makeScene(elem);
            const radius = .8;
            const widthSegments = 4;
            const heightSegments = 2;
            const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
            const material = new THREE.MeshPhongMaterial({color: 'blue', flatShading: true});
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            return (time, rect) => {
                mesh.rotation.y = time * .1;
                camera.aspect = rect.width / rect.height;
                camera.updateProjectionMatrix();
                controls.handleResize();
                controls.update();
                renderer.render(scene, camera);
            };
        },
    };

    document.querySelectorAll('[data-diagram]').forEach((elem) => {
        const sceneName = elem.dataset.diagram;
        const sceneInitFunction = sceneInitFunctionsByName[sceneName];
        const sceneRenderFunction = sceneInitFunction(elem);
        addScene(elem, sceneRenderFunction);
    })


    function render( time ) {

        time *= 0.001;

        for ( const { elem, fn, ctx } of sceneElements ) {

            const rect = elem.getBoundingClientRect();
            const { left, right, top, bottom, width, height } = rect;
            const rendererCanvas = renderer.domElement;

            const isOffscreen =
                bottom < 0 ||
                top > window.innerHeight ||
                right < 0 ||
                left > window.innerWidth;

            if ( ! isOffscreen ) {

                if ( rendererCanvas.width < width || rendererCanvas.height < height ) {

                    renderer.setSize( width, height, false );

                }

                if ( ctx.canvas.width !== width || ctx.canvas.height !== height ) {

                    ctx.canvas.width = width;
                    ctx.canvas.height = height;

                }

                renderer.setScissor( 0, 0, width, height );
                renderer.setViewport( 0, 0, width, height );

                fn( time, rect );

                ctx.globalCompositeOperation = 'copy';
                ctx.drawImage(
                    rendererCanvas,
                    0, rendererCanvas.height - height, width, height, // src rect
                    0, 0, width, height ); // dst rect

            }

        }

        requestAnimationFrame( render );

    }

    requestAnimationFrame(render);
}