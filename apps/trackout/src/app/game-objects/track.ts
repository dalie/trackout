import {
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
} from '@babylonjs/core';

export function setupTrack(scene: Scene): Mesh {
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 10000, height: 10000 },
    scene
  );
  ground.receiveShadows = true;
  ground.position.y = -0.01;

  new PhysicsAggregate(
    ground,
    PhysicsShapeType.BOX,
    { mass: 0, restitution: 0.5 },
    scene
  );

  return ground;
}
