import {
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  ShadowGenerator,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';

export function setupCar(scene: Scene, shadowGenerator: ShadowGenerator): Mesh {
  const cube = MeshBuilder.CreateBox(
    'cube',
    { width: 2, height: 1, depth: 4 },
    scene
  );
  cube.receiveShadows = false;
  shadowGenerator.addShadowCaster(cube);

  // create the material with its texture for the cube and assign it to the cube
  const cubeMaterial = new StandardMaterial('car_surface', scene);
  cubeMaterial.diffuseTexture = new Texture('assets/sun.jpg', scene);
  cube.material = cubeMaterial;

  cube.position.y = 10;
  cube.position.x = 0;
  cube.position.z = 0;

  const aggregate = new PhysicsAggregate(
    cube,
    PhysicsShapeType.BOX,
    { mass: 1000, restitution: 0.2 },
    scene
  );

  scene.registerAfterRender(() => {
    cube.rotate(new Vector3(0, 1, 0), -0.02, Space.LOCAL);
  });
  return cube;
}
