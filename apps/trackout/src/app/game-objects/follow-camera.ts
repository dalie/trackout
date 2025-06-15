import { FollowCamera, Mesh, Scene, Vector3 } from '@babylonjs/core';

export function setupCamera(scene: Scene, target: Mesh) {
  const camera = new FollowCamera('camera1', new Vector3(30, 20, 30), scene);

  camera.lockedTarget = target;
  return camera;
}
