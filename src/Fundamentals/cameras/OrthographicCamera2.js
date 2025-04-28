import * as THREE from 'three'

export default function OrthographicCamera2() {

    // 캔버스
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas})

    // 원점을 2D 캔버스처럼 왼쪽 위에 위치
    const left = 0;
    const right = 300;
    const top = 0;
    const bottom = 150;
    const near = -1;
    const far = 1;
    const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    camera.zoom = 1;

    const scene = new THREE.Scene();
    // 장면 백그라운드 기본값 설정
    scene.background = new THREE.Color(0x000000);

    // 텍스처 추가
    const loader = new THREE.TextureLoader();
    const textures = [
        loader.load("/banners/JavaBanner.png"),
        loader.load("/banners/JsBanner.png"),
        loader.load("/banners/SpringBanner.png"),
        loader.load("/banners/TsBanner.png"),
    ];
    const planeSize = 256;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planes = textures.map((texture) => {
        const planePivot = new THREE.Object3D();
        scene.add(planePivot);
        texture.magFilter = THREE.NearestFilter;
        const planeMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        planePivot.add(mesh);

        mesh.position.set(planeSize / 2, planeSize / 2, 0);
        return planePivot;
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

    function render(time) {
        time *= 0.0001;

        if (resizeRendererToDisplaySize(renderer)) {
            camera.right = canvas.width;
            camera.bottom = canvas.height;
            camera.updateProjectionMatrix();
        }


        const distAcross = Math.max(20, canvas.width - planeSize);
        const distDown = Math.max(20, canvas.height - planeSize);

        // total distance to move across the back
        const xRange = distAcross * 2;
        const yRange = distDown * 2;
        const speed = 180;

        planes.forEach((plane, ndx) => {
            const t = time * speed + ndx * 300;

            const xt = t % xRange;
            const yt = t % yRange;

            const x = xt < distAcross ? xt : xRange - xt;
            const y = yt < distDown ? yt : yRange - yt;

            plane.position.set(x, y, 0);
        })

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

