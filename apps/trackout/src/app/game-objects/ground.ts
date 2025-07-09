import {
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
} from '@babylonjs/core';
import { setupMaterial } from './material';

export function setupGround(scene: Scene): Mesh {
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 10000, height: 10000 },
    scene
  );
  ground.receiveShadows = true;
  ground.position.y = -0.01;

  // Create the material using the setupMaterial function
  const mat = setupMaterial('asphalt', 1000, scene);
  ground.material = mat;

  new PhysicsAggregate(
    ground,
    PhysicsShapeType.BOX,
    { mass: 0, restitution: 0.5, friction: 20 },
    scene
  );

  return ground;
}
