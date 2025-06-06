import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export default function MakeMCVE() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1000, 2000);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    scene.add(new THREE.GridHelper(5000, 10));

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
            material.depthTest = false;
            curveObject.renderOrder = 1;
            scene.add(curveObject);

        }

    }

    const geometry = new THREE.BoxGeometry(100, 100, 300);
    const material = new THREE.MeshBasicMaterial({color: 'cyan'});
    const cars = [];
    for (let i = 0; i < 10; ++i) {

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        cars.push(mesh);

    }

    const carPosition = new THREE.Vector3();
    const carTarget = new THREE.Vector3();

    function render(time) {

        time *= 0.001; // convert to seconds

        {
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

            });

        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);

}