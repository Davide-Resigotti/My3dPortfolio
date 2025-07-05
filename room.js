import * as THREE from 'three';
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';

// Scene
const scene = new THREE.Scene();

// Loader
const loadingManager = new THREE.LoadingManager();
const loader = new GLTFLoader(loadingManager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

// Camera1
let camera;
let mixer;
let camera1 = new THREE.Object3D();
loader.load('./camera1.glb', (gltf) => {
    camera1 = gltf.scene;
    scene.add(camera1);
    console.log('camera1 loaded');

    // Imposta camera1 come la fotocamera principale
    camera1.traverse((child) => {
        if (child.isCamera) {
            camera = child;
            camera.fov = 40;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
    });

    // Animation
    mixer = new THREE.AnimationMixer(camera1);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'CameraAction');
    const action = mixer.clipAction(clip);

    document.getElementById('cameraActionButton').addEventListener('click', () => {
        if (action.isRunning()) {
            action.stop();
        } else {
            action.play();
        }
    });

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = false;
    controls.autoRotateSpeed = 0.3;
    controls.dampingFactor = 0.08;

    // GUI
    const gui = new GUI();
    gui.open();
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.position, 'x').min(-100).max(100).step(0.1).name('Camera X');
    cameraFolder.add(camera.position, 'y').min(-100).max(100).step(0.1).name('Camera Y');
    cameraFolder.add(camera.position, 'z').min(-100).max(100).step(0.1).name('Camera Z');

    const clock = new THREE.Clock();

    const loop = () => {
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(loop);
    }

    loop();
});


// Lights
const light = new THREE.PointLight(0xffffff, 20, 500, 0.7);
light.position.set(-23, -8, -40);
scene.add(light);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.room')
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

// Progress Bar
const progressBar = document.getElementById('progress-bar');
const label1 = document.getElementById('label1');
const label2 = document.getElementById('label2');

loadingManager.onProgress = (urlOfLastItem, itemsLoaded, itemsTotal) => {
    progressBar.value = (itemsLoaded / itemsTotal) * 100;
    if (progressBar.value >= 90) {
        label1.style.display = 'none';
        label2.style.display = 'block';
    } else {
        label1.style.display = 'block';
        label2.style.display = 'none';
    }
}

const progressBarContainer = document.querySelector('.progress-bar-container');

const navBar = document.getElementById('navbar');
const canvas = document.querySelector('.room');
navBar.style.opacity = 0;

loadingManager.onLoad = () => {
    progressBarContainer.style.display = 'none';

    gsap.fromTo(navBar, {
        y: -50,
        opacity: 0
    }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.inOut'
    });

    gsap.fromTo(canvas, {
        y: -50,
        opacity: 0
    }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.inOut'
    });

   
}

// MODELS
// room
let room = new THREE.Object3D();

loader.load('./scene.gltf', (gltf) => {
    room = gltf.scene;

    // Calculate the bounding box of the room
    const box = new THREE.Box3().setFromObject(room);

    // Calculate the center of the bounding box
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Move the room so that its center is at the origin
    room.position.sub(center);
    room.scale.set(1, 1, 1);

    scene.add(room);
    console.log('room loaded');
});

// Resizing etc
window.addEventListener('resize', () => {
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
});


