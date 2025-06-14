import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export default function Transparency2() {

    const canvas = document.querySelector( '#c' );
    const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 25;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0.5, 1, 0.5 );

    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 0, 0, 0 );
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 'white' );

    function addLight( x, y, z ) {

        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight( color, intensity );
        light.position.set( x, y, z );
        scene.add( light );

    }

    addLight( - 1, 2, 4 );
    addLight( 1, - 1, - 2 );

    const planeWidth = 0.5;
    const planeHeight = 1;
    const geometry = new THREE.PlaneGeometry( planeWidth, planeHeight );

    const loader = new THREE.TextureLoader();

    function makeInstance( geometry, color, rotY, url ) {

        const base = new THREE.Object3D();
        scene.add( base );
        base.rotation.y = rotY;

        [ - 1, 1 ].forEach( ( x ) => {

            const texture = loader.load( url, render );
            texture.offset.x = x < 0 ? 0 : 0.5;
            texture.repeat.x = .5;
            texture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.MeshPhongMaterial( {
                color,
                map: texture,
                opacity: 0.5,
                transparent: true,
                side: THREE.DoubleSide,
            } );

            const mesh = new THREE.Mesh( geometry, material );
            base.add( mesh );

            mesh.position.x = x * .25;

        } );

    }

    makeInstance( geometry, 'pink', 0, '/examples/sadface.jpg' );
    makeInstance( geometry, 'lightblue', Math.PI * 0.5, '/examples/smileface.jpeg' );

    function resizeRendererToDisplaySize( renderer ) {

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if ( needResize ) {

            renderer.setSize( width, height, false );

        }

        return needResize;

    }

    let renderRequested = false;

    function render() {

        renderRequested = undefined;

        if ( resizeRendererToDisplaySize( renderer ) ) {

            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

        }

        renderer.render( scene, camera );

    }

    render();

    function requestRenderIfNotRequested() {

        if ( ! renderRequested ) {

            renderRequested = true;
            requestAnimationFrame( render );

        }

    }

    controls.addEventListener( 'change', requestRenderIfNotRequested );
    window.addEventListener( 'resize', requestRenderIfNotRequested );

}