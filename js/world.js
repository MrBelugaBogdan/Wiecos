// js/world.js
import * as THREE from 'three';
import { world } from './physics.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

export function initWorld() {
    // Світло з усіх боків
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 10, 7);
    scene.add(sunLight);

    // Візуальна земля
    const groundGeo = new THREE.BoxGeometry(100, 1, 100); // Робимо її об'ємною
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x33aa33 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.5; // Опускаємо, щоб поверхня була на 0
    scene.add(groundMesh);

    // Фізична земля
    const groundBody = new CANNON.Body({ 
        mass: 0, 
        shape: new CANNON.Box(new CANNON.Vec3(50, 0.5, 50)) 
    });
    world.addBody(groundBody);
}
