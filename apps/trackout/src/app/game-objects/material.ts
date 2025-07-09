import { PBRMaterial, Scene, Texture } from '@babylonjs/core';

export function setupMaterial(
  matName: string,
  scale: number,
  scene: Scene
): PBRMaterial {
  const mat = new PBRMaterial(matName, scene);
  const textures = [
    'albedoTexture',
    //'specularTexture',
    //'bumpTexture',
  ] as const;

  for (const textureName of textures) {
    const texture = new Texture(
      `assets/textures/${matName}/${textureName}.jpg`,
      scene
    );
    texture.uScale = scale;
    texture.vScale = scale;
    mat[textureName] = texture;
  }
  return mat;
}
