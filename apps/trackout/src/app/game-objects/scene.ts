import {
  AbstractEngine,
  Color4,
  DirectionalLight,
  HavokPlugin,
  Scene,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

export async function setupScene(engine: AbstractEngine) {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);

  // --- Havok Physics Setup ---
  const havokInstance = await HavokPhysics({
    locateFile: () => {
      return 'assets/HavokPhysics.wasm';
    },
  });
  scene.enablePhysics(
    new Vector3(0, -9.81, 0),
    new HavokPlugin(false, havokInstance)
  );

  //const hemisphericLight = scene.createDefaultHemisphericLight();
  const light = new DirectionalLight(
    'dirLight',
    new Vector3(0.5, -0.5, 0.5),
    scene
  );
  light.position.y = 100;
  //light.intensity = 1.0;

  // Create ShadowGenerator
  const shadowGenerator = new ShadowGenerator(1024, light);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  //shadowGenerator.setDarkness(0.3);

  return { scene, shadowGenerator };
}
