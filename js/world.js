import * as THREE from 'three';
import { world } from './physics.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

export function initWorld() {
    // Світло
    const light = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(light);

    // Візуальна земля
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x33aa33 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    scene.add(groundMesh);

    // Фізична земля
    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);
}
