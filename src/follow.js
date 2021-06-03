// author: Fyrestar <info@mevedia.com>
import * as THREE from "three";
export function follow(player, camera)
{
  camera.position.set(0,250,-200)
  camera.rotateY(40)
  //Offset from camera to player
  var relativeCameraOffset = new THREE.Vector3(0,5,10);

  //UPDATE PLAYER WORLD MATRIX FOR PERFECT CAMERA FOLLOW
  player.updateMatrixWorld()
  //Apply offset to player matrix
  var cameraOffset = relativeCameraOffset.applyMatrix4( player.matrixWorld );

  //Apply position offset to camera DIRECTLY -> NOT SMOOTH
  // camera.position.x = cameraOffset.x;
  // camera.position.y = cameraOffset.y;
  // camera.position.z = cameraOffset.z;

  //SMOOTH CAMERA POSITION TO TARGET POSITION
  camera.position.lerp(cameraOffset, 0.1);
  camera.lookAt( player.position.x,player.position.y+225,player.position.z );

}
