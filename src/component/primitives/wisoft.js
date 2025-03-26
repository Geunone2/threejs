import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'


export default function Wisoft() {

    // 캔버스 설정
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 24);

    camera.position.z = 12;

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

    // 문자(wisoft) 크기 설정
    const loader = new FontLoader();

    loader.load("/data/Origram_Regular.json", (font) => {
        const text = `HBNU\nwisoft.io`
        const wisoftGeometry = new TextGeometry(text, {
            font: font,
            size: 1.8,
            depth: 0.2,
            curveSegments: 32,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.02,
        });

        // text 기준 중심으로 회전축 회전
        wisoftGeometry.computeBoundingBox();
        if (wisoftGeometry.boundingBox) {
            const centerX = (wisoftGeometry.boundingBox.max.x + wisoftGeometry.boundingBox.min.x) / 2;
            const centerY = (wisoftGeometry.boundingBox.max.y + wisoftGeometry.boundingBox.min.y) / 2;
            const centerZ = (wisoftGeometry.boundingBox.max.z + wisoftGeometry.boundingBox.min.z) / 2;
            wisoftGeometry.translate(-centerX, -centerY, -centerZ);
        }

        const wisoftMaterial = new THREE.MeshBasicMaterial({color: 0x6C63FF, side: THREE.DoubleSide, });
        const wisoft = new THREE.Mesh(wisoftGeometry, wisoftMaterial);


        scene.add(wisoft);
        renderer.render(scene, camera);



        function render(time) {
            time *= 0.0002;

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }

            wisoft.rotation.y = time;

            renderer.render(scene, camera);

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    })

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

}