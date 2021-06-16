import * as THREE from 'three';
import {adjustLight} from "./space/light";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {follow} from "./follow";
import {Vector3} from "three";
import {update} from './bubbleprogress';

let camera, scene, renderer;
const clock = new THREE.Clock();
let gltfLoader, dracoLoader, fbxLoader;
let recruiter, recruiterMixer, recruiterIdle, recruiterWalk, recruiterWalkBackwards, recruiterWalkLeft,
  recruiterWalkRight, recruiterHover = false;
let developer, developerMixer, developerIdle, developerWalk, developerWalkBackwards, developerWalkLeft,
  developerWalkRight, developerEndAnim, developerHover = false;
let activePlayer, activePlayerIdle, activePlayerWalk, activePlayerWalkBackwards, activePlayerWalkLeft,
  activePlayerWalkRight;
let angelo, angeloMixer, angeloIdle, angeloIdle2, angeloIdle3, angeloText;
let ambiente;
let chatTimer, chatIndex;
let chatArray = ['Hi ', 'Angelo: I am happy that you are here!', 'Angelo: I lost my memory, I don\'t remember who I am', 'Angelo: Can you help me recover my memory?'];

let signed;
let frontVector = new Vector3();

let user = {
  type: null,
  name: null,
  email: null
};

let keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  arrowup: false,
  arrowdown: false,
  arrowleft: false,
  arrowright: false,
  space: false
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
  const container = document.getElementById('container');
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

  gltfLoader = new GLTFLoader(manager);
  dracoLoader = new DRACOLoader(manager);
  fbxLoader = new FBXLoader(manager)
  dracoLoader.setDecoderPath('three/examples/js/libs/draco/');
  gltfLoader.setDRACOLoader(dracoLoader);

  // Scena principale
  scene = new THREE.Scene();

  whoareyou = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('who are you', font, 50)
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
  fbxLoader.load('models/recruiter/mrmeeseeks_original.fbx', (fbx) => {
    fbx.position.set(-290, 0, 50);
    fbx.scale.setScalar(9);
    fbx.traverse(c => {
      c.castShadow = true;
    })
    recruiterMixer = new THREE.AnimationMixer(fbx);
    fbxLoader.load('models/recruiter/breathing_idle.fbx', (anim) => {
      recruiterIdle = recruiterMixer.clipAction(anim.animations[0]).play();
    })
    fbxLoader.load('models/recruiter/happy_walk.fbx', (anim) => {
      recruiterWalk = recruiterMixer.clipAction(anim.animations[0]);
    })
    fbxLoader.load('models/recruiter/happy_walk_backwards.fbx', (anim) => {
      recruiterWalkBackwards = recruiterMixer.clipAction(anim.animations[0]);
    })
    fbxLoader.load('models/recruiter/walk_left.fbx', (anim) => {
      recruiterWalkLeft = recruiterMixer.clipAction(anim.animations[0]);
    })
    fbxLoader.load('models/recruiter/walk_right.fbx', (anim) => {
      recruiterWalkRight = recruiterMixer.clipAction(anim.animations[0]);
    })
    recruiter.add(fbx);
  });
  scene.add(recruiter);

  // Recruiter Text
  recruiterText = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('Recruiter', font, 50)
    const text = new THREE.Mesh(geometry, textColor);
    text.position.set(-370, 0, 150)
    recruiterText.add(text)
  });
  scene.add(recruiterText);

  // developer
  developer = new THREE.Scene();
  fbxLoader.load('models/developer/rick_rigged_original.fbx', (fbx) => {
    fbx.position.set(290, 0, 70);
    fbx.scale.setScalar(0.7);
    fbx.traverse(c => {
      c.castShadow = true;
    })
    developerMixer = new THREE.AnimationMixer(fbx);
    fbxLoader.load('models/developer/drunk_idle.fbx', (anim) => {
      developerIdle = developerMixer.clipAction(anim.animations[0]).play()
    })
    fbxLoader.load('models/developer/drunk_walk.fbx', (anim) => {
      developerWalk = developerMixer.clipAction(anim.animations[0]);
    })
    fbxLoader.load('models/developer/drunk_walk_backwards.fbx', (anim) => {
      developerWalkBackwards = developerMixer.clipAction(anim.animations[0]);
    })
    fbxLoader.load('models/developer/left_walk.fbx', (anim) => {
      developerWalkLeft = developerMixer.clipAction(anim.animations[0]);
    })
    fbxLoader.load('models/developer/right_walk.fbx', (anim) => {
      developerWalkRight = developerMixer.clipAction(anim.animations[0]);
    })
    // fbxLoader.load('models/developer/gunplay.fbx', (anim) => {
    //   developerEndAnim = developerMixer.clipAction(anim.animations[0]);
    // })
    developer.add(fbx);
  });
  scene.add(developer);

  // Developer Text
  developerText = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('Developer', font, 50)
    const text = new THREE.Mesh(geometry, textColor);
    text.position.set(120, 0, 150)
    developerText.add(text)
  });
  scene.add(developerText);

  // Angelo
  angelo = new THREE.Scene();
  fbxLoader.load('models/angelo/morty_original.fbx', (fbx) => {
    fbx.position.set(0, 0, 350);
    fbx.rotateY(9.3)
    fbx.scale.setScalar(0.6);
    fbx.traverse(c => {
      c.castShadow = true;
    })
    angeloMixer = new THREE.AnimationMixer(fbx);
    fbxLoader.load('models/angelo/sad_idle.fbx', (anim) => {
      angeloIdle = angeloMixer.clipAction(anim.animations[0]).play();
    })
    fbxLoader.load('models/angelo/sad_idle_2.fbx', (anim) => {
      angeloIdle2 = angeloMixer.clipAction(anim.animations[0]);
    })
    angelo.add(fbx);
  });

  //angelo Text
  angeloText = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('angelo', font, 30)
    const text = new THREE.Mesh(geometry, textColor);
    text.position.set(65, 200, 340)
    text.rotateY(9.3)
    angeloText.add(text)
  });

  // Renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  // EventListeners
  document.addEventListener('mousemove', onMouseMove, false);
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

  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  manager.onLoad = function () {
    document.getElementById('container').hidden=false;
    document.getElementById('loader').hidden=true;
  };
  manager.onProgress = function (url, itemsLoaded, itemsTotal) {

    update(itemsLoaded/itemsTotal*100);
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };
  manager.onError = function (url) {
    alert('There was an error loading ' + url);
  };

}

function creaGeometria(nome, font, size) {
  return new THREE.TextGeometry(nome, {
    font: font,
    size: size,
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
    removeEventsListener()
    document.getElementById('wyn').hidden = false;
    document.getElementById('inpR').hidden = false;
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
    removeEventsListener()
    document.getElementById('wyn').hidden = false;
    document.getElementById('inpD').hidden = false;
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
    document.removeEventListener('mousemove', onMouseMove, false);
  }
}

function onMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Rilevazione intersezione mouse/recruiter
  const recruiterIntersects = raycaster.intersectObjects(recruiter.children, true);
  const developerIntersects = raycaster.intersectObjects(developer.children, true);
  if (recruiterIntersects.length > 0 || developerIntersects.length > 0)
    document.addEventListener('click', onMouseClick, false);
  else
    document.removeEventListener('click', onMouseClick, false);
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
  if (angeloMixer) angeloMixer.update(delta);
  if (activePlayer && signed) {
    activePlayer.children[0].lookAt(frontVector)
    if (keys.w || keys.arrowup) {
      document.getElementById("arrowkeys").hidden=true
      frontVector.z += 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalk.play()
      activePlayerIdle.stop()
    } else if (!keys.w && !keys.arrowup && activePlayerWalk) {
      activePlayerIdle.play()
      activePlayerWalk.stop()
    }
    if (keys.s || keys.arrowdown) {
      frontVector.z -= 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalkBackwards.play()
      activePlayerIdle.stop()
    } else if (!keys.s && !keys.arrowdown && activePlayerWalkBackwards) {
      activePlayerIdle.play()
      activePlayerWalkBackwards.stop()
    }
    if (keys.a || keys.arrowleft) {
      frontVector.x += 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalkLeft.play()
      activePlayerIdle.stop()
    } else if (!keys.a && !keys.arrowleft && activePlayerWalkLeft) {
      activePlayerIdle.play()
      activePlayerWalkLeft.stop()
    }
    if (keys.d || keys.arrowright) {
      frontVector.x -= 1
      activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
      camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
      activePlayerWalkRight.play()
      activePlayerIdle.stop()
    } else if (!keys.d && !keys.arrowright && activePlayerWalkRight) {
      activePlayerIdle.play()
      activePlayerWalkRight.stop()
    }
    if (activePlayer.children[0].position.x > -150
      && activePlayer.children[0].position.x < 150
      && activePlayer.children[0].position.z > 190
      && activePlayer.children[0].position.z < 350) {
      if (chatTimer === undefined)
        document.getElementById('clickSpace').hidden = false;
      if (keys.space) {
        chatHandler()
      }
    } else {
      document.getElementById('clickSpace').hidden = true;
    }
  }

  render();
}

function chatHandler() {
  if (chatTimer === undefined) {
    angeloIdle2.play()
    angeloIdle.stop()
    chatIndex = 0;
    chatTimer = Date.now() / 1000;
    document.getElementById('chat').innerText = 'Angelo: Hi ' + user.name + '!';
    document.getElementById('clickSpace').hidden = true;
    document.getElementById('chat').hidden = false;
  }
  if ((Date.now() / 1000 - chatTimer) > 1) {
    chatTimer = Date.now() / 1000;
    if (chatIndex > 2) {
      choose()
      return
    }
    chatIndex++;
    document.getElementById('chat').innerText = chatArray[chatIndex];
  }
}

function choose() {
  document.getElementById('choose').hidden = false;
  document.getElementById('no').addEventListener('click', onMouseClick => {
    document.getElementById('choose').hidden = true;
    document.getElementById('chat').hidden = true;
    chatTimer = undefined;
  })
  document.getElementById('yes').addEventListener('click', onMouseClick => {
    document.getElementById('choose').hidden = true;
    // document.getElementById('chat').innerText = 'Thank you!';

    //DA ELIMINARE START
    document.getElementById('chat').innerText = 'Something went wrong, come back in the next few days!';
    setTimeout(function(){
      document.getElementById('chat').hidden = true;
      document.getElementById('clickSpace').hidden = true;
      chatTimer = undefined;}, 2000)
    //DA ELIMINARE FINE

    // if (user.type === 'developer') {
    //   setTimeout(function(){ window.location.replace("https://stackoverflow.com") }, 3000)
    // } else if (user.type === 'recruiter') {
    //   setTimeout(function(){ window.location.replace("https://stackoverflow.com") }, 3000)
    // }
  })


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
  if (document.getElementById('inpDname').value) {
    user.type = 'developer'
    user.name = document.getElementById('inpDname').value;
    welcome(user)
  } else if (document.getElementById('inpRname').value) {
    user.type = 'recruiter'
    user.name = document.getElementById('inpRname').value;
    welcome(user)
  } else return;
  console.log(user)
  document.getElementById('wyn').hidden = true;
  document.getElementById('inpR').hidden = true;
  document.getElementById('inpD').hidden = true;
  signed = true;
  frontVector.z += 1
  activePlayer.children[0].position.set(frontVector.x, frontVector.y, frontVector.z - 100)
  camera.position.set(frontVector.x, frontVector.y + 225, frontVector.z - 400)
}

function welcome(user) {
  let welcome = new THREE.Scene();
  textLoader.load(fontUrl, function (font) {
    const geometry = creaGeometria('welcome ' + user.name, font, 30)
    const text = new THREE.Mesh(geometry, textColor);
    if (user.type === 'developer')
      text.position.set(-450, 300, 0)
    else
      text.position.set(100, 300, 0)
    welcome.add(text)
  });
  scene.add(welcome);
  welcome.rotateY(9.43)
  scene.add(angelo)
  scene.add(angeloText)
  document.getElementById("arrowkeys").hidden=false
}
