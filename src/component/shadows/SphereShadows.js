import * as THREE from 'three'
import {OrbitControls} from "three/addons/controls/OrbitControls.js"

export default function SphereShadows() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        logarithmicDepthBuffer: true,
    });

    // 카메라
    const fov = 45;
    const aspect = 2;
    const near = 0.00001;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 10, 20);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    // OrbitControls 추가
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const loader = new THREE.TextureLoader();

    // 체커보드(바닥) 텍스처 생성
    {
        const planeSize = 40;

        const texture = loader.load('/examples/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        // 텍스처 XY 평면 -> XZ 평면으로 회전
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        planeMat.color.setRGB(1.5, 1.5, 1.5);
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }

    // 그림자 텍스처 생성
    const shadowTexture = loader.load('examples/roundshadow.png')


    // 구체 객체 생성
    const sphereShadowBases = [];

    const sphereRadius = 1;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);

    // 평면(가짜 그림자) 객체 생성
    const planeSize = 1;
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);


    // 15개의 구체 객체에 메쉬 & 위치 적용
    const numSpheres = 15;

    for (let i = 0; i < numSpheres; ++i) {
        // 그림자와 구체를 위한 베이스를 만들어, 둘이 함께 움직이도록 한다.
        const base = new THREE.Object3D();
        scene.add(base);

        // 베이스에 그림자 추가
        // 참고: 각 구체마다 새로운 재질(material)을 생성
        // 그렇게 해야 각 구체의 재질 투명도를 개별적으로 설정 가능하다.
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false,
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.y = 0.001;
        shadowMesh.rotation.x = Math.PI * -.5;
        const shadowSize = sphereRadius * 4;
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
        base.add(shadowMesh);

        // 베이스에 구체 추가
        const u = i / numSpheres;
        const sphereMat = new THREE.MeshPhongMaterial();
        sphereMat.color.setHSL(u, 1, .75);
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.set(0, sphereRadius + 2, 0);
        base.add(sphereMesh);

        sphereShadowBases.push({base, sphereMesh, shadowMesh, y: sphereMesh.position.y});
    }


    // 조명(HemisSphereLight) 1번 추가
    {
        const skyColor = 0xB1E1FF;
        const groundColor = 0xB97A20;
        const intensity = 2;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }

    // 조명(DirectionalLight) 2번 추가
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 5);
        light.target.position.set(-5,0,0);
        scene.add(light);
        scene.add(light.target);
    }

    // 카메라 업데이트
    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    updateCamera();

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

    // 애니메이션 추가
    function render(time) {
        time *= 0.001;
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        sphereShadowBases.forEach((sphereShadowBase, ndx) => {
            const {base, sphereMesh, shadowMesh, y} = sphereShadowBase;

            const u = ndx / sphereShadowBases.length;

            const speed = time * .2;
            const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
            const radius = Math.sin(speed - ndx) * 10;
            base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

            const yOff = Math.abs(Math.sin(time * 2 + ndx));

            sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
            shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);

        })

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
