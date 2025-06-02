import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export function LoadGLTF() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})
    renderer.shadowMap.enabled = true;

    // 카메라
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#DEFEFF');

    {

        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);

    }

    // 조명(HemisphereLight) 추가
    {
        const skyColor = 0xB1E1FF;
        const groundColor = 0xB97A20;
        const intensity = 3;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    // 조명(DirectionalLight) 추가
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.castShadow = true;
        light.position.set(-250, 800, -850);
        light.target.position.set(-550, 40, -450);

        light.shadow.bias = -0.004;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        scene.add(light);
        scene.add(light.target);

        const cam = light.shadow.camera;
        cam.near = 1;
        cam.far = 2000;
        cam.left = -1500;
        cam.right = 1500;
        cam.top = 1500;
        cam.bottom = -1500;

        const cameraHelper = new THREE.CameraHelper( cam );
        scene.add( cameraHelper );
        cameraHelper.visible = false;
        const helper = new THREE.DirectionalLightHelper( light, 100 );
        scene.add( helper );
        helper.visible = false;

        function makeXYZGUI( gui, vector3, name, onChangeFn ) {

            const folder = gui.addFolder( name );
            folder.add( vector3, 'x', vector3.x - 500, vector3.x + 500 ).onChange( onChangeFn );
            folder.add( vector3, 'y', vector3.y - 500, vector3.y + 500 ).onChange( onChangeFn );
            folder.add( vector3, 'z', vector3.z - 500, vector3.z + 500 ).onChange( onChangeFn );
            folder.open();

        }

        function updateCamera() {

            // update the light target's matrixWorld because it's needed by the helper
            light.updateMatrixWorld();
            light.target.updateMatrixWorld();
            helper.update();
            // update the light's shadow camera's projection matrix
            light.shadow.camera.updateProjectionMatrix();
            // and now update the camera helper we're using to show the light's shadow camera
            cameraHelper.update();

        }

        updateCamera();

        class DimensionGUIHelper {

            constructor( obj, minProp, maxProp ) {

                this.obj = obj;
                this.minProp = minProp;
                this.maxProp = maxProp;

            }
            get value() {

                return this.obj[ this.maxProp ] * 2;

            }
            set value( v ) {

                this.obj[ this.maxProp ] = v / 2;
                this.obj[ this.minProp ] = v / - 2;

            }

        }

        class MinMaxGUIHelper {

            constructor( obj, minProp, maxProp, minDif ) {

                this.obj = obj;
                this.minProp = minProp;
                this.maxProp = maxProp;
                this.minDif = minDif;

            }
            get min() {

                return this.obj[ this.minProp ];

            }
            set min( v ) {

                this.obj[ this.minProp ] = v;
                this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );

            }
            get max() {

                return this.obj[ this.maxProp ];

            }
            set max( v ) {

                this.obj[ this.maxProp ] = v;
                this.min = this.min; // this will call the min setter

            }

        }

        class VisibleGUIHelper {

            constructor( ...objects ) {

                this.objects = [ ...objects ];

            }
            get value() {

                return this.objects[ 0 ].visible;

            }
            set value( v ) {

                this.objects.forEach( ( obj ) => {

                    obj.visible = v;

                } );

            }

        }

        const gui = new GUI();
        gui.close();
        gui.add( new VisibleGUIHelper( helper, cameraHelper ), 'value' ).name( 'show helpers' );
        gui.add( light.shadow, 'bias', - 0.1, 0.1, 0.001 );
        {

            const folder = gui.addFolder( 'Shadow Camera' );
            folder.open();
            folder.add( new DimensionGUIHelper( light.shadow.camera, 'left', 'right' ), 'value', 1, 4000 )
                .name( 'width' )
                .onChange( updateCamera );
            folder.add( new DimensionGUIHelper( light.shadow.camera, 'bottom', 'top' ), 'value', 1, 4000 )
                .name( 'height' )
                .onChange( updateCamera );
            const minMaxGUIHelper = new MinMaxGUIHelper( light.shadow.camera, 'near', 'far', 0.1 );
            folder.add( minMaxGUIHelper, 'min', 1, 1000, 1 ).name( 'near' ).onChange( updateCamera );
            folder.add( minMaxGUIHelper, 'max', 1, 4000, 1 ).name( 'far' ).onChange( updateCamera );
            folder.add( light.shadow.camera, 'zoom', 0.01, 1.5, 0.01 ).onChange( updateCamera );

        }

        makeXYZGUI( gui, light.position, 'position', updateCamera );
        makeXYZGUI( gui, light.target.position, 'target', updateCamera );

    }

    const cars = [];
    {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/3DModels/PolyCity/scene.gltf', (gltf) => {
            const root = gltf.scene;
            scene.add(root);

            root.traverse((obj) => {
                if (obj.castShadow !== undefined) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            })

            // console.log(dumpObject(root).join('\n'));

            const loadedCars = root.getObjectByName("Cars");
            const fixes = [
                {prefix: 'Car_08', y: 0, rot: [Math.PI * .5, 0, Math.PI * .5],},
                {prefix: 'CAR_03', y: 33, rot: [0, Math.PI, 0],},
                {prefix: 'Car_04', y: 40, rot: [0, Math.PI, 0],},
            ];

            root.updateMatrixWorld();
            for (const car of loadedCars.children.slice()) {
                const fix = fixes.find(fix => car.name.startsWith(fix.prefix));
                const obj = new THREE.Object3D();
                car.position.set(0, fix.y, 0);
                car.rotation.set(...fix.rot)
                obj.add(car);
                scene.add(obj);
                cars.push(obj);
            }

            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
            controls.update();
        })
    }

    // Cars 주행 코드
    let curve;
    let curveObject;
    {
        const controlPoints = [
            [1.118281, 5.115846, -3.681386],
            [3.948875, 5.115846, -3.641834],
            [3.960072, 5.115846, -0.240352],
            [3.985447, 5.115846, 4.585005],
            [-3.793631, 5.115846, 4.585006],
            [-3.826839, 5.115846, -14.736200],
            [-14.542292, 5.115846, -14.765865],
            [-14.520929, 5.115846, -3.627002],
            [-5.452815, 5.115846, -3.634418],
            [-5.467251, 5.115846, 4.549161],
            [-13.266233, 5.115846, 4.567083],
            [-13.250067, 5.115846, -13.499271],
            [4.081842, 5.115846, -13.435463],
            [4.125436, 5.115846, -5.334928],
            [-14.521364, 5.115846, -5.239871],
            [-14.510466, 5.115846, 5.486727],
            [5.745666, 5.115846, 5.510492],
            [5.787942, 5.115846, -14.728308],
            [-5.423720, 5.115846, -14.761919],
            [-5.373599, 5.115846, -3.704133],
            [1.004861, 5.115846, -3.641834],
        ];

        const p0 = new THREE.Vector3();
        const p1 = new THREE.Vector3();
        curve = new THREE.CatmullRomCurve3(
            controlPoints.map((p, ndx) => {
                p0.set(...p);
                p1.set(...controlPoints[(ndx + 1) % controlPoints.length]);

                return [
                    (new THREE.Vector3()).copy(p0),
                    (new THREE.Vector3()).lerpVectors(p0, p1, 0.1),
                    (new THREE.Vector3()).lerpVectors(p0, p1, 0.9),
                ];
            }).flat(),
            true,
        );
        {
            const points = curve.getPoints(250);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({color: 0xff0000});
            curveObject = new THREE.Line(geometry, material);
            curveObject.scale.set(100, 100, 100);
            curveObject.position.y = -621;
            curveObject.visible = false;
            material.depthTest = false;
            curveObject.renderOrder = 1;
            scene.add(curveObject);
        }
    }

    function dumpVec3(v3, precision = 3) {
        return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`
    }

    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(
            `${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`
        );

        const dataPrefix = obj.children.length
            ? (isLast ? '  │ ' : '│ │ ')
            : (isLast ? '    ' : '│   ');

        lines.push(
            `${prefix}${dataPrefix} pos: ${dumpVec3(obj.position)}`
        )
        lines.push(
            `${prefix}${dataPrefix} pos: ${dumpVec3(obj.rotation)}`
        )
        lines.push(
            `${prefix}${dataPrefix} pos: ${dumpVec3(obj.scale)}`
        )

        const newPrefix = prefix + (isLast ? ' ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
            const isLast = ndx === lastNdx;
            dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();

        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

        camera.near = boxSize / 100;
        camera.far = boxSize * 100;

        camera.updateProjectionMatrix();

        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
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

    const carPosition = new THREE.Vector3();
    const carTarget = new THREE.Vector3();

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        if (cars) {
            const pathTime = time * .01;
            const targetOffset = 0.01;
            cars.forEach((car, ndx) => {
                const u = pathTime + ndx / cars.length;

                curve.getPointAt(u % 1, carPosition);
                carPosition.applyMatrix4(curveObject.matrixWorld);

                curve.getPointAt((u + targetOffset) % 1, carTarget);
                carTarget.applyMatrix4(curveObject.matrixWorld);

                car.position.copy(carPosition);
                car.lookAt(carTarget);

                car.position.lerpVectors(carPosition, carTarget, 0.5);
            })
        }

        renderer.render(scene, camera);


        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}