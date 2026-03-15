import * as THREE from 'three';
import { initWorld, scene } from './world.js';
import { initPlayer, updatePlayer, camera } from './player.js';
import { updatePhysics } from './physics.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

initWorld();
initPlayer();

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    updatePlayer();
    renderer.render(scene, camera);
}
animate();
