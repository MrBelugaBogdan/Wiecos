import * as THREE from 'three';
import { world } from './physics.js';
import { scene } from './world.js';

export let playerBody, playerMesh, camera;
let keys = {};

export function initPlayer() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    playerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    scene.add(playerMesh);

    playerBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        position: new CANNON.Vec3(0, 5, 0),
        fixedRotation: true
    });
    world.addBody(playerBody);

    window.addEventListener('keydown', (e) => keys[e.code] = true);
    window.addEventListener('keyup', (e) => keys[e.code] = false);
}

export function updatePlayer() {
    const speed = 5;
    let x = 0, z = 0;

    if (keys['KeyW']) z -= speed;
    if (keys['KeyS']) z += speed;
    if (keys['KeyA']) x -= speed;
    if (keys['KeyD']) x += speed;

    playerBody.velocity.x = x;
    playerBody.velocity.z = z;

    playerMesh.position.copy(playerBody.position);
    
    // Камера за гравцем
    camera.position.set(playerMesh.position.x, playerMesh.position.y + 5, playerMesh.position.z + 10);
    camera.lookAt(playerMesh.position);
}
