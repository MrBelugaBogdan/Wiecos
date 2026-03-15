// js/main.js
import * as THREE from 'three';
import { initWorld, scene } from './world.js';
import { initPlayer, updatePlayer, camera } from './player.js';
import { updatePhysics } from './physics.js';

let renderer;

export function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    initWorld();
    initPlayer();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    updatePlayer();
    renderer.render(scene, camera);
}
