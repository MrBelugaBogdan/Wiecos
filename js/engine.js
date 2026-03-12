import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// ПЕРЕВІРКА ФІЗИКИ
if (typeof CANNON === 'undefined') {
    console.error("Помилка: Фізичний двигун CANNON не завантажився. Перевір інтернет!");
}

// --- ФІЗИКА ---
const world = new (CANNON.World || Object); // Захист від помилки
if (world.gravity) world.gravity.set(0, -9.82, 0);

// --- ГРАФІКА ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Світло
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// Земля (Візуальна)
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({ color: 0x44aa44 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Земля (Фізична)
if (typeof CANNON !== 'undefined') {
    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);
}

// Гравець
const playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshLambertMaterial({ color: 0xff4444 })
);
scene.add(playerMesh);

let playerBody;
if (typeof CANNON !== 'undefined') {
    playerBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        position: new CANNON.Vec3(0, 5, 0),
        fixedRotation: true
    });
    world.addBody(playerBody);
}

// --- КЕРУВАННЯ ---
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());

let moveF = false, moveB = false, moveL = false, moveR = false;
let zoomDistance = 8;
const minZoom = 0; // 0 дозволить зайти в "першу особу"
const maxZoom = 20;

document.addEventListener('wheel', (e) => {
    zoomDistance += e.deltaY * 0.01;
    zoomDistance = Math.max(minZoom, Math.min(zoomDistance, maxZoom));
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveF = true;
    if (e.code === 'KeyS') moveB = true;
    if (e.code === 'KeyA') moveL = true;
    if (e.code === 'KeyD') moveR = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveF = false;
    if (e.code === 'KeyS') moveB = false;
    if (e.code === 'KeyA') moveL = false;
    if (e.code === 'KeyD') moveR = false;
});

// Анімація
function animate() {
    requestAnimationFrame(animate);
    
    if (typeof CANNON !== 'undefined') {
        world.step(1/60);
        playerMesh.position.copy(playerBody.position);
        
        if (controls.isLocked) {
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            dir.y = 0; dir.normalize();
            const side = new THREE.Vector3().crossVectors(camera.up, dir).normalize();

            const speed = 10;
            if (moveF) { playerBody.velocity.x = dir.x * speed; playerBody.velocity.z = dir.z * speed; }
            if (moveB) { playerBody.velocity.x = -dir.x * speed; playerBody.velocity.z = -dir.z * speed; }
            if (moveL) { playerBody.velocity.x = side.x * speed; playerBody.velocity.z = side.z * speed; }
            if (moveR) { playerBody.velocity.x = -side.x * speed; playerBody.velocity.z = -side.z * speed; }
        }
    }

    // ЛОГІКА КАМЕРИ ROBLOX-STYLE
    if (zoomDistance < 0.5) {
        // Перша особа
        camera.position.copy(playerMesh.position);
        camera.position.y += 0.8;
    } else {
        // Третя особа
        const offset = new THREE.Vector3(0, 2, zoomDistance);
        offset.applyQuaternion(camera.quaternion); 
        camera.position.copy(playerMesh.position).add(offset);
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
