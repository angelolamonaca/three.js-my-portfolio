import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {adjustLight} from "./space/light";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {follow} from "./follow";

let camera, scene, renderer;
const clock = new THREE.Clock();
let recruiter, recruiterMixer, recruiterHover = false;
let developer, developerMixer, developerHover = false;
let ambiente;

let keys = {
  a: false,
  s: false,
  d: false,
  w: false
};
let activePlayer;

let recruiterText, developerText, friendText, whoareyou;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const textLoader = new THREE.FontLoader();
const fontUrl = "fonts/DESIGNER_Regular.json";
const textColor = new THREE.MeshBasicMaterial({
  color: new THREE.Color("white"),
  side: THREE.DoubleSide
});

let mouseX = 0;
let windowHalfX = window.innerWidth / 2;


init();
animate();

function init() {

  // Container
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Camera
  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 225, 550);

  // Loading Manager
  const manager = new THREE.LoadingManager(() => {

    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener('transitionend', onTransitionEnd);

  });
  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  manager.onLoad = function () {
    console.log('Loading complete!');
  };
  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  manager.onError = function (url) {
    console.log('There was an error loading ' + url);
  };

  const gltfLoader = new GLTFLoader(manager);
  const dracoLoader = new DRACOLoader(manager);
  const fbxLoader = new FBXLoader(manager)
  dracoLoader.setDecoderPath('three/examples/js/libs/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);

  // Scena principale
  scene = new THREE.Scene();

  whoareyou = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('who are you', font)
    const text = new THREE.Mesh(geometry, textColor);
    text.position.set(-180, 350, 250)
    whoareyou.add(text)
  });
  scene.add(whoareyou);



  ambiente = new THREE.Scene();
  gltfLoader.load('models/cyberpunk-office/source/CyberpunkOffice.glb', function (object) {
    // recruiterMixer = new THREE.AnimationMixer( object );
    // recruiterAction = recruiterMixer.clipAction( object.animations[ 0 ] );
    // recruiterAction.play()
    // recruiterAction.timeScale = 0;
    object.scene.position.set(0,0,0);
    object.scene.scale.set(100,100,100)

    ambiente.add(object.scene);
  });
  scene.add(ambiente);

  // Luci
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  const dirLight = new THREE.DirectionalLight(0xffffff);
  adjustLight(hemiLight, dirLight, scene);

  // Recruiter
  recruiter = new THREE.Scene();
  fbxLoader.load('models/recruiter/Robot.fbx',  (fbx) => {

    fbx.position.set(-290,0,50);
    fbx.scale.setScalar(1.2);
    fbx.traverse(c=> {
      c.castShadow = true;
    })

    fbxLoader.load('models/recruiter/Offensive_Idle.fbx', (anim) => {
      recruiterMixer = new THREE.AnimationMixer(fbx);
      recruiterMixer.clipAction(anim.animations[0]).play();
    })
    recruiter.add( fbx );
  });
  scene.add(recruiter);

  // Recruiter Text
  recruiterText = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('Recruiter', font)
    const text = new THREE.Mesh(geometry, textColor);
    text.position.set(-370, 0, 150)
    recruiterText.add(text)
  });
  scene.add(recruiterText);

  // developer
  developer = new THREE.Scene();
  fbxLoader.load('models/developer/Robot.fbx',  (fbx) => {

    fbx.position.set(290,0,50);
    fbx.scale.setScalar(3);
    fbx.traverse(c=> {
      c.castShadow = true;
    })

    fbxLoader.load('models/developer/Warrior_Idle.fbx', (anim) => {
      developerMixer = new THREE.AnimationMixer(fbx);
      developerMixer.clipAction(anim.animations[0]).play();
    })
    developer.add( fbx );
  });
  scene.add(developer);

  // Developer Text
  developerText = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('Developer', font)
    const text = new THREE.Mesh(geometry, textColor);
    text.position.set(120, 0, 150)
    developerText.add(text)
  });
  scene.add(developerText);

  // Renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  // Controllo orbitale
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.target.set(0, 100, 0);
  // controls.update();

  // EventListeners
  document.addEventListener('click', onMouseClick, false);
  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('mousemove', onDocumentMouseMove);
  document.body.addEventListener( 'keydown', function(e) {

    const key = e.code.replace('Key', '').toLowerCase();
    if ( keys[ key ] !== undefined )
      keys[ key ] = true;

  });
  document.body.addEventListener( 'keyup', function(e) {

    const key = e.code.replace('Key', '').toLowerCase();
    if ( keys[ key ] !== undefined )
      keys[ key ] = false;

  });

}

function creaGeometria(nome, font) {
  return new THREE.TextGeometry(nome, {
    font: font,
    size: 50,
    height: 1
  })
}

function onMouseClick(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Rilevazione intersezione mouse/recruiter
  const recruiterIntersects = raycaster.intersectObjects(recruiter.children, true);
  const developerIntersects = raycaster.intersectObjects(developer.children, true);

  if (recruiterIntersects.length>0) {
    console.log('hai cliccato su recruiter')
    removeEventsListener()
    follow(recruiter, camera)
    activePlayer = recruiter;
  } else if (developerIntersects.length>0) {
    console.log('hai cliccato su developer')
    removeEventsListener()
    follow(developer, camera)
    activePlayer = developer;
  }

  function removeEventsListener() {
    document.removeEventListener('click', onMouseClick, false);
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mousemove', onDocumentMouseMove);
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Rilevazione intersezione mouse/recruiter
  const recruiterIntersects = raycaster.intersectObjects(recruiter.children, true);
  const developerIntersects = raycaster.intersectObjects(developer.children, true);

  if (recruiterIntersects.length > 0 && recruiterHover === false) {
    recruiterHover = true
    recruiterText.translateY(25);
  } else if (recruiterIntersects.length === 0 && recruiterHover === true) {
    recruiterHover = false
    recruiterText.translateY(-25);
  } else if (developerIntersects.length > 0 && developerHover === false) {
    developerHover = true
    developerText.translateY(25);
  } else if (developerIntersects.length === 0 && developerHover === true) {
    developerHover = false
    developerText.translateY(-25);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (recruiterMixer) recruiterMixer.update(delta);
  renderer.render(scene, camera);
  if (developerMixer) developerMixer.update(delta);
  renderer.render(scene, camera);

  if ( keys.w ) {
    console.log('Pressed w')
    activePlayer.translateZ(2)
  }
  else if ( keys.s ) {
    console.log('Pressed s')
    activePlayer.translateZ(-2)
  }
  if ( keys.a ) {
    console.log('Pressed a')
    activePlayer.children[0].rotateY(0.05);
  }
  else if ( keys.d ) {
    console.log('Pressed d')
    activePlayer.children[0].rotateY(-0.05);
  }
  render();
}

function onDocumentMouseMove(event) {

  mouseX = (event.clientX - windowHalfX) / 2;
  // mouseY = (event.clientY - windowHalfY) / 100;

}
function render() {
  camera.position.x += (mouseX - camera.position.x) * .01;
   //camera.position.y += (mouseY - camera.position.y) * .01;
  //camera.lookAt(scene.position.x,scene.position.y+225,scene.position.z);


}

function onTransitionEnd(event) {

  event.target.remove();

}
