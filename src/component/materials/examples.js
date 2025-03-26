import * as THREE from 'three';

export default function Sphere() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 32);

    camera.position.z = 20;

    // 씬 생성
    const scene = new THREE.Scene();

    // 밝기 설정
    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // 박스 크기 설정
    const radius = 4;
    const widthSegments = 12;
    const heightSegments = 32;
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    // const sphereMaterial = new THREE.MeshPhongMaterial({
    //     color: 0xFF0000,
    //     flatShading: true,
    // })

    // const sphereMaterial = new THREE.MeshPhongMaterial();
    // sphereMaterial.color.setHSL(0, 1, .5);
    // sphereMaterial.flatShading = true;

    const m1 = new THREE.MeshBasicMaterial({color: "purple"});
    // const m2 = new THREE.MeshPhongMaterial({color: "black", emissive: "purple", shininess: 0});
    const m2 = new THREE.MeshPhongMaterial({color: "black", emissive: "purple", flatShading: false});
    const m3 = new THREE.MeshPhongMaterial({color: "black", emissive: "purple", flatShading: true});

    function makeInstance(sphereGeometry, x, material) {
        const sphere = new THREE.Mesh(sphereGeometry, material);
        scene.add(sphere);

        sphere.position.x = x;

        return sphere;
    }

    const spheres = [
        makeInstance(sphereGeometry, -12, m1),
        makeInstance(sphereGeometry, 0, m2),
        makeInstance(sphereGeometry, 12, m3),
    ]


    renderer.render(scene, camera);

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
        time *= 0.0002;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        spheres.forEach((sphere) => {
            sphere.rotation.y = time;
        })


        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

