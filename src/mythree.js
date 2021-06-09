import * as THREE from 'three';
import {adjustLight} from "./space/light";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {follow} from "./follow";
import {Vector3} from "three";

let wyn = document.getElementById('wyn');
let inpR = document.getElementById('inpR');
let inpD = document.getElementById('inpD');
let camera, scene, renderer;
const clock = new THREE.Clock();
let recruiter, recruiterMixer, recruiterIdle, recruiterWalk, recruiterWalkBackwards, recruiterWalkLeft,
  recruiterWalkRight, recruiterHover = false;
let developer, developerMixer, developerIdle, developerWalk, developerWalkBackwards, developerWalkLeft,
  developerWalkRight, developerHover = false;
let activePlayer, activePlayerIdle, activePlayerWalk, activePlayerWalkBackwards, activePlayerWalkLeft,
  activePlayerWalkRight;
let ambiente;

let signed;
let frontVector = new Vector3();

let keys = {
  a: false,
  s: false,
  d: false,
  w: false
};

let recruiterText, developerText, whoareyou;
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
    object.scene.position.set(0, 0, 0);
    object.scene.scale.set(100, 100, 100)
    ambiente.add(object.scene);
  });
  scene.add(ambiente);

  // Luci
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  const dirLight = new THREE.DirectionalLight(0xffffff);
  adjustLight(hemiLight, dirLight, scene);

  // Recruiter
  recruiter = new THREE.Scene();
  fbxLoader.load('models/recruiter/Robot.fbx', (fbx) => {

    fbx.position.set(-290, 0, 50);
    fbx.scale.setScalar(1.2);
    fbx.traverse(c => {
      c.castShadow = true;
    })

    recruiterMixer = new THREE.AnimationMixer(fbx);
    fbxLoader.load('models/recruiter/Offensive_Idle.fbx', (anim) => {
      recruiterIdle = recruiterMixer.clipAction(anim.animations[0]).play();
    })
    recruiter.add(fbx);

    fbxLoader.load('models/recruiter/Dwarf_Walk.fbx', (anim) => {
      recruiterWalk = recruiterMixer.clipAction(anim.animations[0]);
    })
    recruiter.add(fbx);

    fbxLoader.load('models/recruiter/Walking_Backward.fbx', (anim) => {
      recruiterWalkBackwards = recruiterMixer.clipAction(anim.animations[0]);
    })
    recruiter.add(fbx);

    fbxLoader.load('models/recruiter/Walk_Strafe_Left.fbx', (anim) => {
      recruiterWalkLeft = recruiterMixer.clipAction(anim.animations[0]);
    })
    recruiter.add(fbx);

    fbxLoader.load('models/recruiter/Walk_Strafe_Right.fbx', (anim) => {
      recruiterWalkRight = recruiterMixer.clipAction(anim.animations[0]);
    })
    recruiter.add(fbx);
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
  fbxLoader.load('models/developer/Robot.fbx', (fbx) => {

    fbx.position.set(290, 0, 50);
    fbx.scale.setScalar(3);
    fbx.traverse(c => {
      c.castShadow = true;
    })

    developerMixer = new THREE.AnimationMixer(fbx);
    fbxLoader.load('models/developer/Warrior_Idle.fbx', (anim) => {
      developerIdle = developerMixer.clipAction(anim.animations[0])
      developerIdle.play()
    })
    developer.add(fbx);

    fbxLoader.load('models/developer/Dwarf_Walk.fbx', (anim) => {
      developerWalk = developerMixer.clipAction(anim.animations[0]);
    })
    developer.add(fbx);

    fbxLoader.load('models/developer/Walking_Backward.fbx', (anim) => {
      developerWalkBackwards = developerMixer.clipAction(anim.animations[0]);
    })
    developer.add(fbx);

    fbxLoader.load('models/developer/Walk_Strafe_Left.fbx', (anim) => {
      developerWalkLeft = developerMixer.clipAction(anim.animations[0]);
    })
    developer.add(fbx);

    fbxLoader.load('models/developer/Walk_Strafe_Right.fbx', (anim) => {
      developerWalkRight = developerMixer.clipAction(anim.animations[0]);
    })
    developer.add(fbx);
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

  // EventListeners
  document.addEventListener('click', onMouseClick, false);
  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('mousemove', onDocumentMouseMove);
  document.getElementById("signInDbutton").addEventListener("click", signin, false);
  document.getElementById("signInRbutton").addEventListener("click", signin, false);
  document.body.addEventListener('keydown', function (e) {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined)
      keys[key] = true;
  });
  document.body.addEventListener('keyup', function (e) {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined)
      keys[key] = false;

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

  if (recruiterIntersects.length > 0) {
    console.log('hai cliccato su recruiter')
    removeEventsListener()
    document.getElementById('wyn').hidden = false;
    inpR.hidden = false;
    developer.visible = false;
    recruiterText.visible = false;
    developerText.visible = false;
    whoareyou.visible = false;
    follow(recruiter, camera)
    activePlayer = recruiter;
    frontVector.set(activePlayer.children[0].position.x, activePlayer.children[0].position.y, activePlayer.children[0].position.z + 100)
    activePlayerIdle = recruiterIdle;
    activePlayerWalk = recruiterWalk;
    activePlayerWalkBackwards = recruiterWalkBackwards;
    activePlayerWalkLeft = recruiterWalkLeft;
    activePlayerWalkRight = recruiterWalkRight;
  } else if (developerIntersects.length > 0) {
    console.log('hai cliccato su developer')
    removeEventsListener()
    wyn.hidden = false;
    inpD.hidden = false;
    recruiter.visible = false;
    recruiterText.visible = false;
    developerText.visible = false;
    whoareyou.visible = false;
    follow(developer, camera)
    activePlayer = developer;
    frontVector.set(activePlayer.children[0].position.x, activePlayer.children[0].position.y, activePlayer.children[0].position.z + 100)
    activePlayerIdle = developerIdle;
    activePlayerWalk = developerWalk;
    activePlayerWalkBackwards = developerWalkBackwards;
    activePlayerWalkLeft = developerWalkLeft;
    activePlayerWalkRight = developerWalkRight;
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
  if (developerMixer) developerMixer.update(delta);
  if (activePlayer && signed) {
    activePlayer.children[0].lookAt(frontVector)
    if (keys.w) {
      frontVector.z += 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalk.play()
      activePlayerIdle.stop()
    } else if (!keys.w && activePlayerWalk) {
      activePlayerIdle.play()
      activePlayerWalk.stop()
    }
    if (keys.s) {
      frontVector.z -= 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalkBackwards.play()
      activePlayerIdle.stop()
    } else if (!keys.s && activePlayerWalkBackwards) {
      activePlayerIdle.play()
      activePlayerWalkBackwards.stop()
    }
    if (keys.a) {
      frontVector.x += 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalkLeft.play()
      activePlayerIdle.stop()
    } else if (!keys.a && activePlayerWalkLeft) {
      activePlayerIdle.play()
      activePlayerWalkLeft.stop()
    }
    if (keys.d) {
      frontVector.x -= 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalkRight.play()
      activePlayerIdle.stop()
    } else if (!keys.d && activePlayerWalkRight) {
      activePlayerIdle.play()
      activePlayerWalkRight.stop()
    }
    if (activePlayer && signed) {
      // camera.lookAt(frontVector.x, frontVector.y+225, frontVector.z)
    }
  }

  render();
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
}

function render() {
  renderer.render(scene, camera);

  if (!signed)
    camera.position.x += (mouseX - camera.position.x) * .01;


}

function onTransitionEnd(event) {

  event.target.remove();

}

function signin() {
  console.log(document.getElementById('inpDname').value)
  console.log(document.getElementById('inpRname').value)
  wyn.hidden=true;
  inpR.hidden=true;
  inpD.hidden=true;
  signed=true;
  frontVector.z += 1
  activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
  camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
}
