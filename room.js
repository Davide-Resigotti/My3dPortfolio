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

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('.room')
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

// Camera
let view;
let mixer;

view = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
view.position.set(10, 7, 10);

// Controls
const controls = new OrbitControls(view, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = false;
controls.autoRotateSpeed = 0.3;
controls.dampingFactor = 0.08;

// GUI
const gui = new GUI();
gui.open();

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(view.position, 'x').min(-100).max(100).step(0.1).name('Camera X');
cameraFolder.add(view.position, 'y').min(-100).max(100).step(0.1).name('Camera Y');
cameraFolder.add(view.position, 'z').min(-100).max(100).step(0.1).name('Camera Z');
cameraFolder.close();

// Lights
const backLight = new THREE.PointLight(0xffffff, 20, 500, 0.7);
backLight.position.set(-23, -8, -40);
scene.add(backLight);

const frontLight = new THREE.PointLight(0xffffff, 50, 300, 0.7);
frontLight.position.set(40, 45, 25);
scene.add(frontLight);

const backLightFolder = gui.addFolder('Back Light');
backLightFolder.add(backLight.position, 'x').min(-100).max(100).step(0.1).name('Back Light X');
backLightFolder.add(backLight.position, 'y').min(-100).max(100).step(0.1).name('Back Light Y');
backLightFolder.add(backLight.position, 'z').min(-100).max(100).step(0.1).name('Back Light Z');

const frontLightFolder = gui.addFolder('Front Light');
frontLightFolder.add(frontLight.position, 'x').min(-100).max(100).step(0.1).name('Front Light X');
frontLightFolder.add(frontLight.position, 'y').min(-100).max(100).step(0.1).name('Front Light Y');
frontLightFolder.add(frontLight.position, 'z').min(-100).max(100).step(0.1).name('Front Light Z');

const clock = new THREE.Clock();

const loop = () => {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, view);
    window.requestAnimationFrame(loop);
}

loop();

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
    if (view) {
        view.aspect = window.innerWidth / window.innerHeight;
        view.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
});


