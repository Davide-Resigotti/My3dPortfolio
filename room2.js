import * as THREE from 'three';
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';


//Scene
const scene = new THREE.Scene();


//Progress Bar
const loadingManager = new THREE.LoadingManager();
const progressBar = document.getElementById('progress-bar');
const label1 = document.getElementById('label1');
const label2 = document.getElementById('label2');

loadingManager.onProgress = (urlOfLastItem, itemsLoaded, itemsTotal) => {
  progressBar.value = itemsLoaded / itemsTotal * 100;
  if (progressBar.value >= 50) {
    label1.style.display = 'none';
    label2.style.display = 'block';
  } else {
    label1.style.display = 'block';
    label2.style.display = 'none';
  }
}

const progressBarContainer = document.querySelector('.progress-bar-container');

const navBar = document.getElementById('navbar');
navBar.style.opacity = 0;

if (progressBarContainer) {
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

// camera positions
let reverse = false;

const cameraPositions = [
  { x: 4, y: 8, z: 7 },
  { x: -2, y: 1, z: 3 },
  { x: 0.4, y: 0, z: 0.2 },
  { x: 2, y: 1, z: 2 }
];
let currentCameraIndex = 0;

function animateRotation() {
  controls.autoRotateSpeed = reverse ? -0.3 : 0.3; 
  setTimeout(() => {
    reverse = !reverse; 
    gsap.to(controls, {
      duration: 2,
      onComplete: () => {
        // Cambia la posizione della camera tra le posizioni predefinite con effetto di dissolvenza
        currentCameraIndex = (currentCameraIndex + 1) % cameraPositions.length;
        const newPosition = cameraPositions[currentCameraIndex];
        
        gsap.to(camera.position, {
          duration: 1,
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z,
          onUpdate: () => camera.updateProjectionMatrix()
        });

        animateRotation();
      }
    });
  }, 15000);
}

    gsap.to(controls, {
        duration: 0.4,
        autoRotateSpeed: 200, 
        onComplete: () => {
            animateRotation();

        
        }
    });

  }
}




const loader = new GLTFLoader(loadingManager);

// Create a DRACOLoader instance
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

// Attach DRACOLoader to GLTFLoader
loader.setDRACOLoader(dracoLoader);

let model = new THREE.Object3D();

loader.load('./scene.gltf', (gltf) => {
   model = gltf.scene;

   // Calculate the bounding box of the model
   const box = new THREE.Box3().setFromObject(model);
    
   // Calculate the center of the bounding box
   const center = new THREE.Vector3();
   box.getCenter(center);
   
   // Move the model so that its center is at the origin
   model.position.sub(center);

   scene.add(model);
   console.log('room loaded');
});



//sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight 
}


//axes
// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);


//light
const light = new THREE.PointLight(0xffffff, 20, 500,0.7);
light.position.set(-23,-8,-40);
scene.add(light);


//camera
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height,1,1000);
camera.position.set(4, 7, 7);
scene.add(camera);


// GUI
const gui = new GUI();

gui.open();


const cameraFolder = gui.addFolder('Camera');

cameraFolder.add(camera.position, 'x').min(-100).max(100).step(0.2).name('Light X');
cameraFolder.add(camera.position, 'y').min(-100).max(100).step(0.2).name('Light Y');
cameraFolder.add(camera.position, 'z').min(-100).max(100).step(0.2).name('Light Z');



//renderer
const canvas = document.querySelector('.room');
const renderer = new THREE.WebGLRenderer({canvas,alpha: true});
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);


//controls
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = false;
controls.autoRotate = true;
controls.dampingFactor = 0.08;


//resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
})

const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
   
}

loop();

