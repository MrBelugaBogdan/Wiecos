import * as THREE from 'three';
// Тепер шлях короткий завдяки importmap
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { world } from './physics.js';
import { scene } from './world.js';

// ... (решта коду без змін)

export let playerBody, playerMesh, camera, controls;
let keys = {};

export function initPlayer() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Створюємо візуального гравця
    playerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    scene.add(playerMesh);

    // Створюємо фізику гравця
    playerBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        position: new CANNON.Vec3(0, 5, 0),
        fixedRotation: true
    });
    world.addBody(playerBody);

    // Додаємо керування мишкою (хостинг для PointerLockControls)
    controls = new PointerLockControls(camera, document.body);

    // Клік по екрану ховає мишку
    document.body.addEventListener('click', () => {
        controls.lock();
    });

    window.addEventListener('keydown', (e) => keys[e.code] = true);
    window.addEventListener('keyup', (e) => keys[e.code] = false);
}

export function updatePlayer() {
    if (!controls.isLocked) return; // Не рухаємось, якщо мишка не захоплена

    const speed = 10;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();

    // Розраховуємо напрямок вперед/назад
    frontVector.set(0, 0, Number(keys['KeyS']) - Number(keys['KeyW']));
    // Розраховуємо напрямок вліво/вправо
    sideVector.set(Number(keys['KeyD']) - Number(keys['KeyA']), 0, 0);

    // Комбінуємо та направляємо відносно погляду камери
    direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(speed)
        .applyQuaternion(camera.quaternion);

    // Застосовуємо швидкість до фізичного тіла (крім осі Y, щоб не заважати гравітації)
    playerBody.velocity.x = direction.x;
    playerBody.velocity.z = direction.z;

    // Синхронізуємо модель з фізикою
    playerMesh.position.copy(playerBody.position);
    
    // Прив'язуємо камеру до голови гравця
    camera.position.copy(playerBody.position);
    camera.position.y += 0.8; 
}
