import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import {useGLTF} from "@react-three/drei";

export default function SolarSystem() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // lil-gui 설정
    const gui = new GUI();

    // 카메라 설정
    const fov = 40;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(0, 50, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    // 씬 생성
    const scene = new THREE.Scene();

    // 조명 설정
    {
        const color = 0xFFFFFF;
        const intensity = 500;
        const light = new THREE.PointLight(color, intensity);
        scene.add(light);
    }

    // 배열
    const objects = [];

    // 태양계 설정
    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);
    objects.push(solarSystem);

    // (태양-지구) 설정
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 10;
    solarSystem.add(earthOrbit);
    objects.push(earthOrbit);

    // 태양(구) 크기 설정
    const radius = 1;
    const widthSegments = 6;
    const heightSegments = 6;
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);


    const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);

    sunMesh.scale.set(5, 5, 5);

    // 지구(구) 설정
    const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);

    // (지구-달) 설정
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    earthOrbit.add(moonOrbit);

    // 달(구) 설정
    const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(.5, .5, .5);


    earthMesh.position.x = 10;

    earthOrbit.add(earthMesh);
    objects.push(earthMesh);
    moonOrbit.add(moonMesh);
    objects.push(moonMesh);

    solarSystem.add(sunMesh);
    objects.push(sunMesh);
    solarSystem.add(earthMesh);
    objects.push(earthMesh);
    solarSystem.add(earthOrbit);
    objects.push(earthOrbit);

    // 축과 그리드를 모두 온/오프하는 역할을 한다.
// lil-gui는 체크박스를 만들기 위해 불리언 값을 반환하는 속성이 필요하여,
// visible 속성에 대해 getter & setter 를 만들어
// lil-gui가 이를 참조하도록 설정한다.
    class AxisGridHelper {
        constructor(node, units = 10) {
            const axes = new THREE.AxesHelper();
            axes.material.depthTest = false;
            axes.renderOrder = 2;
            node.add(axes);


            const grid = new THREE.GridHelper(units, units);
            grid.material.depthTest = false;
            grid.renderOrder = 1;
            node.add(grid);

            this.grid = grid;
            this.axes = axes;
            this.visible = false;
        }

        get visible() {
            return this._visible;
        }

        set visible(v) {
            this._visible = v;
            this.grid.visible = v;
            this.axes.visible = v;
        }
    }

    function makeAxisGrid(node, label, units) {
        const helper = new AxisGridHelper(node, units);
        gui.add(helper, 'visible').name(label);
    }

    makeAxisGrid(solarSystem, 'solarSystem', 26);
    makeAxisGrid(sunMesh, 'sunMesh');
    makeAxisGrid(earthOrbit, 'earthOrbit');
    makeAxisGrid(earthMesh, 'earthMesh');
    makeAxisGrid(moonOrbit, 'moonOrbit');
    makeAxisGrid(moonMesh, 'moonMesh');


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

        time *= 0.0001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // 각 코드에 AxesHelper 추가
        // objects.forEach((node) => {
        //     const axes = new THREE.AxesHelper();
        //     axes.material.depthTest = false;
        //     axes.renderOrder = 1;
        //     node.add(axes);
        // })

        objects.forEach((obj) => {
            obj.rotation.y = time;
        })

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}