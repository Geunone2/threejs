import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from "three/addons/loaders/OBJLoader.js"
import {MTLLoader} from "three/addons/loaders/MTLLoader.js"

export default function LoadObj() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

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
        light.position.set(5, 10, 2);
        scene.add(light);
        scene.add(light.target);
    }

    // #2 특정 재질을 찾아, 수동으로 설정
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('3DModels/windmill1/windmill_001.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
                console.log(Object.values(mtl.materials));
            }
            objLoader.setMaterials(mtl);
            objLoader.load('3DModels/windmill1/windmill_001.obj', (root) => {
                scene.add(root);
            });
        })
    }
    // 텍스처 추가
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('/examples/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);

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

// 큐브 시간 기준으로 X & Y축으로 회전
    function render() {

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

// #1 모든 재질 순회하여, DoubleSide 설정
// {
//     const mtlLoader = new MTLLoader();
//     mtlLoader.load('3DModels/windmill_001.mtl', (mtl) => {
//         mtl.preload();
//         const objLoader = new OBJLoader();
//         for (const material of Object.values(mtl.materials)) {
//             material.side = THREE.DoubleSide;
//         }
//         objLoader.setMaterials(mtl);
//         objLoader.load('3DModels/windmill_001.obj', (root) => {
//             scene.add(root);
//         });
//     })
// }

// #2 특정 재질을 찾아, 수동으로 설정
// {
//     const mtlLoader = new MTLLoader();
//     mtlLoader.load('3DModels/windmill_001.mtl', (mtl) => {
//         mtl.preload();
//         mtl.materials.Material.side = THREE.DoubleSide;
//         const objLoader = new OBJLoader();
//         objLoader.setMaterials(mtl);
//         objLoader.load('3DModels/windmill_001.obj', (root) => {
//             scene.add(root);
//         });
//     })
// }

// // #3 MTL 파일을 생성하지 않고, 직접 재질 생성
//     {
//         const mtlLoader = new MTLLoader();
//         mtlLoader.load('3DModels/windmill_001.mtl', (mtl) => {
//             mtl.preload();
//             const objLoader = new OBJLoader();
//             objLoader.setMaterials(mtl);
//             objLoader.load('3DModels/windmill_001.obj', (root) => {
//                 const materials = {
//                     Material: new THREE.MeshBasicMaterial({}),
//                     windmill2: new THREE.MeshBasicMaterial({}),
//                 };
//                 root.traverse(node => {
//                     const material = materials[node.material?.name];
//                     if (material) {
//                         node.material = material;
//                     }
//                 })
//                 scene.add(root);
//             });
//         })
//     }