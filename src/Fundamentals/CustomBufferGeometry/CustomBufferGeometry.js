import * as THREE from "three";

export default function CustomBufferGeometry() {
    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 카메라
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 5;

    // 씬
    const scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const vertices = [
        // front
        {pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0],},
        {pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0],},
        {pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1],},
        {pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1],},

        // right
        {pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 0],},
        {pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0],},
        {pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1],},
        {pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 1],},

        // back
        {pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 0],},
        {pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0],},
        {pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1],},
        {pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 1],},

        // left
        {pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0],},
        {pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0],},
        {pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1],},
        {pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1],},

        // top
        {pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 0],},
        {pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0],},
        {pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1],},
        {pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 1],},

        // bottom
        {pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 0],},
        {pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0],},
        {pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1],},
        {pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 1],},
    ];

    const geometry = new THREE.BufferGeometry();

    const numVertices = vertices.length;

    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;

    const positions = new Float32Array(numVertices * positionNumComponents)
    const normals = new Float32Array(numVertices * normalNumComponents)
    const uvs = new Float32Array(numVertices * uvNumComponents);

    let posNdx = 0;
    let nrmNdx = 0;
    let uvNdx = 0;

    for (const vertex of vertices) {
        positions.set(vertex.pos, posNdx);
        normals.set(vertex.norm, nrmNdx);
        uvs.set(vertex.uv, uvNdx);
        posNdx += positionNumComponents;
        nrmNdx += normalNumComponents;
        uvNdx += uvNumComponents;
    }

    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, positionNumComponents));
    geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(normals, normalNumComponents));
    geometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(uvs, uvNumComponents));

    geometry.setIndex([
        0, 1, 2, 2, 1, 3,
        4, 5, 6, 6, 5, 7,
        8, 9, 10, 10, 9, 11,
        12, 13, 14, 14, 13, 15,
        16, 17, 18, 18, 17, 19,
        20, 21, 22, 22, 21, 23,
    ])

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/star.png');
    texture.colorSpace = THREE.SRGBColorSpace;

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color, map: texture});
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;
        return cube;
    }

    const cubes = [
        makeInstance(geometry, 0x88FF88, 0),
        makeInstance(geometry, 0x8888FF, -4),
        makeInstance(geometry, 0xFF8888, 4),
    ]

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

        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }


    requestAnimationFrame(render);
}