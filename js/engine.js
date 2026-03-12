import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 1. ФІЗИКА (CANNON.JS) ---
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Гравітація як у реальності

// Матеріал для підлоги
const groundMaterial = new CANNON.Material("groundMaterial");
const playerMaterialPhys = new CANNON.Material("playerMaterial");

// --- 2. ГРАФІКА (THREE.JS) ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Світло
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// Земля
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshLambertMaterial({ color: 0x33aa33 });
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

// Фізична підлога
const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMaterial });
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// --- 3. ГРАВЕЦЬ ---
let isThirdPerson = false;
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const playerMesh = new THREE.Mesh(playerGeo, playerMat);
scene.add(playerMesh);

// Фізичне тіло гравця (щоб не проходити крізь стіни)
const playerBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
    position: new CANNON.Vec3(0, 5, 0),
    fixedRotation: true // Щоб гравець не падав на бік
});
world.addBody(playerBody);

// Керування
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());

let moveF = false, moveB = false, moveL = false, moveR = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveF = true;
    if (e.code === 'KeyS') moveB = true;
    if (e.code === 'KeyA') moveL = true;
    if (e.code === 'KeyD') moveR = true;
    if (e.code === 'KeyV') isThirdPerson = !isThirdPerson; // ПЕРЕМИКАННЯ КАМЕРИ
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveF = false;
    if (e.code === 'KeyS') moveB = false;
    if (e.code === 'KeyA') moveL = false;
    if (e.code === 'KeyD') moveR = false;
});

// --- 4. ЦИКЛ ГРИ ---
const speed = 5;
function animate() {
    requestAnimationFrame(animate);
    
    // Крок фізики
    world.step(1/60);
    
    // Синхронізація графіки з фізикою
    playerMesh.position.copy(playerBody.position);
    
    if (controls.isLocked) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();

        const side = new THREE.Vector3().crossVectors(camera.up, direction).normalize();

        if (moveF) playerBody.velocity.x = direction.x * speed, playerBody.velocity.z = direction.z * speed;
        if (moveB) playerBody.velocity.x = -direction.x * speed, playerBody.velocity.z = -direction.z * speed;
        if (moveL) playerBody.velocity.x = side.x * speed, playerBody.velocity.z = side.z * speed;
        if (moveR) playerBody.velocity.x = -side.x * speed, playerBody.velocity.z = -side.z * speed;
        
        // Гальмування, якщо кнопки не натиснуті
        if (!moveF && !moveB && !moveL && !moveR) {
            playerBody.velocity.x *= 0.9;
            playerBody.velocity.z *= 0.9;
        }
    }

    // ЛОГІКА КАМЕРИ
    if (isThirdPerson) {
        // Третя особа: камера ззаду
        const relativeCameraOffset = new THREE.Vector3(0, 2, 5);
        const cameraOffset = relativeCameraOffset.applyQuaternion(playerMesh.quaternion);
        camera.position.x = playerMesh.position.x + cameraOffset.x;
        camera.position.y = playerMesh.position.y + cameraOffset.y;
        camera.position.z = playerMesh.position.z + cameraOffset.z;
        camera.lookAt(playerMesh.position);
    } else {
        // Перша особа: камера всередині голови
        camera.position.copy(playerBody.position);
        camera.position.y += 0.8; 
    }

    renderer.render(scene, camera);
}
animate();
