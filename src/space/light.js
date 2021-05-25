import * as THREE from "three";

export function adjustLight(hemiLight, dirLight, scene) {

    hemiLight.position.set( 0, 200, 0 );
    scene.add( hemiLight );

    dirLight.position.set( 0, 200, 100 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = - 100;
    dirLight.shadow.camera.left = - 120;
    dirLight.shadow.camera.right = 120;
    scene.add( dirLight );
}