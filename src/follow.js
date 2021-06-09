// author: Fyrestar <info@mevedia.com>
import * as THREE from "three";
export function follow(player, camera)
{
  camera.position.set(0,250,-200)
  camera.rotateY(40)

  var relativeCameraOffset = new THREE.Vector3(0,5,10);
  player.updateMatrixWorld()
  var cameraOffset = relativeCameraOffset.applyMatrix4( player.matrixWorld );

  camera.position.lerp(cameraOffset, 0.1);
  camera.lookAt( player.position.x,player.position.y+225,player.position.z );

}
