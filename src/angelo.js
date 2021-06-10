import * as THREE from "three";

export function main(fbxLoader, scene, angelo) {
  // Recruiter
  angelo = new THREE.Scene();
  fbxLoader.load('models/developer/rick_v1.fbx', (fbx) => {

    fbx.position.set(0, 0, 400);
    fbx.rotateY(9)
    fbx.scale.setScalar(1.2);
    fbx.traverse(c => {
      c.castShadow = true;
    })
    angelo.add(fbx)
    // recruiterMixer = new THREE.AnimationMixer(fbx);
    // fbxLoader.load('models/recruiter/Offensive_Idle.fbx', (anim) => {
    //   recruiterIdle = recruiterMixer.clipAction(anim.animations[0]).play();
    // })
    // recruiter.add(fbx);
    //
    // fbxLoader.load('models/recruiter/Dwarf_Walk.fbx', (anim) => {
    //   recruiterWalk = recruiterMixer.clipAction(anim.animations[0]);
    // })
    // recruiter.add(fbx);
    //
    // fbxLoader.load('models/recruiter/Walking_Backward.fbx', (anim) => {
    //   recruiterWalkBackwards = recruiterMixer.clipAction(anim.animations[0]);
    // })
    // recruiter.add(fbx);
    //
    // fbxLoader.load('models/recruiter/Walk_Strafe_Left.fbx', (anim) => {
    //   recruiterWalkLeft = recruiterMixer.clipAction(anim.animations[0]);
    // })
    // recruiter.add(fbx);
    //
    // fbxLoader.load('models/recruiter/Walk_Strafe_Right.fbx', (anim) => {
    //   recruiterWalkRight = recruiterMixer.clipAction(anim.animations[0]);
    // })
    // recruiter.add(fbx);
  });
  scene.add(angelo);

  // Recruiter Text
  // recruiterText = new THREE.Scene();
  // textLoader.load(fontUrl, function (font) {
  //   const geometry = creaGeometria('Recruiter', font, 50)
  //   const text = new THREE.Mesh(geometry, textColor);
  //   text.position.set(-370, 0, 150)
  //   recruiterText.add(text)
  // });
  // scene.add(recruiterText);

}
