import {
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';

export function setupCar(scene: Scene, shadowGenerator: ShadowGenerator): Mesh {
  const carBody = MeshBuilder.CreateBox(
    'carBody',
    { width: 1, height: 1, depth: 2 },
    scene
  );
  carBody.receiveShadows = false;
  shadowGenerator.addShadowCaster(carBody);

  // create the material with its texture for the car body and assign it
  const carMaterial = new StandardMaterial('car_surface', scene);
  carMaterial.diffuseTexture = new Texture('assets/sun.jpg', scene);
  carBody.material = carMaterial;

  carBody.position.y = 2;
  carBody.position.x = 0;
  carBody.position.z = 0;

  const phys = new PhysicsAggregate(
    carBody,
    PhysicsShapeType.BOX,
    { mass: 100, restitution: 0.2 },
    scene
  );

  scene.registerAfterRender(() => {
    //carBody.rotate(new Vector3(0, 1, 0), -0.02, Space.LOCAL);
  });

  scene.onKeyboardObservable.add((kbInfo) => {
    phys.body.disablePreStep = true;
    if (kbInfo.type === 1) {
      const forward = carBody.getDirection(new Vector3(0, 0, -1));
      const force = 10000;
      // KeyDown
      switch (kbInfo.event.key) {
        case 'ArrowUp':
        case 'w':
          phys.body.applyForce(
            forward.multiply(new Vector3(force, 0, force)),
            carBody.position
          );
          console.log('ArrowUp pressed');
          break;
        case 'ArrowDown':
        case 's':
          phys.body.applyForce(
            forward.multiply(new Vector3(-force, 0, -force)),
            carBody.position
          );
          break;
        case 'ArrowLeft':
        case 'a':
          phys.body.applyAngularImpulse(new Vector3(0, -10, 0));
          break;
        case 'ArrowRight':
        case 'd':
          phys.body.applyAngularImpulse(new Vector3(0, 10, 0));
          console.log('ArrowRight pressed');
          break;
        case 'r':
          // Reset car position and forces
          phys.body.setLinearVelocity(Vector3.Zero());
          phys.body.setAngularVelocity(Vector3.Zero());
          phys.body.disablePreStep = false;
          phys.body.transformNode.setAbsolutePosition(new Vector3(0, 2, 0));
          phys.body.transformNode.setDirection(new Vector3(0, 0, 1));
          break;
      }
    }
  });

  return carBody;
}
