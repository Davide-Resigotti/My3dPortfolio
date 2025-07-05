
import * as THREE from 'three';
import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';



//scene
const scene = new THREE.Scene();



const loader = new GLTFLoader();

// Create a DRACOLoader instance
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({ type: 'js' });
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

// Attach DRACOLoader to GLTFLoader
loader.setDRACOLoader(dracoLoader);



let model = new THREE.Object3D();

let mixer;


loader.load('./me.gltf', (gltf) => {
   model = gltf.scene;

   // Calcola il bounding box del modello
   const box = new THREE.Box3().setFromObject(model);
    
   // Calcola il centro del bounding box
   const center = new THREE.Vector3();
   box.getCenter(center);
   
   // Sposta il modello in modo che il suo centro coincida con l'origine
   model.position.sub(center);

  
  model.rotateY(-1.7);

  scene.add(model);

  model.children.forEach((child) => console.log(child.name));

  mixer = new THREE.AnimationMixer(model);
  const clips = gltf.animations;
  const clip = THREE.AnimationClip.findByName(clips, 'full-animation');
  const action = mixer.clipAction(clip);


  //myAnimation
  const target = document.getElementById('two');
  const me = document.querySelector('.me');
  
  me.style.display = 'none';
  
  const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              console.log('me è entrato nella viewport!');
              me.style.display = 'block';
              action.play();
          }
          else {
              console.log('me è uscito dalla viewport!');
              me.style.display = 'none';
              action.stop();
          }
      });
  };


  const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3 
  });


  observer.observe(target);
  

  console.log('me loaded');
});



//sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight 
}


//light
const light = new THREE.AmbientLight(0xffffff, 3);

scene.add(light);



//camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height,0.1,1000);



camera.position.set(-3, 1, 0);


scene.add(camera);


// GUI
const gui = new GUI();

gui.close();



const cameraFolder = gui.addFolder('Camera');

// Add GUI controls for camera position
cameraFolder.add(camera.position, 'x', -100, 100,1).name('Camera X');
cameraFolder.add(camera.position, 'y', -100, 100,1).name('Camera Y');
cameraFolder.add(camera.position, 'z', -100, 100,1).name('Camera Z');



//renderer
const canvas = document.querySelector('.me');
const renderer = new THREE.WebGLRenderer({canvas,alpha: true});
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);


//controls
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.dampingFactor = 0.08;



//resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
})

const clock = new THREE.Clock();

const loop = () => {
  controls.update();
  if(mixer)
    mixer.update(clock.getDelta());
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
   
}

loop();


