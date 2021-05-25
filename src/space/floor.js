export function adjustFloor (mesh, grid, scene) {

    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );

}
