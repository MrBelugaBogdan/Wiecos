export const world = new CANNON.World();
world.gravity.set(0, -15, 0); // Трохи сильніша гравітація для чіткості

export function updatePhysics() {
    world.step(1/60);
}
