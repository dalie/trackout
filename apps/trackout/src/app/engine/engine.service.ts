import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Color3,
  DynamicTexture,
  Engine,
  ImportMeshAsync,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { setupCar } from '../game-objects/car';
import { setupCamera } from '../game-objects/follow-camera';
import { setupGround } from '../game-objects/ground';
import { setupScene } from '../game-objects/scene';
import { WindowRefService } from '../services/window-ref.service';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas!: HTMLCanvasElement;
  private engine!: Engine;
  private scene!: Scene;

  public constructor(
    private ngZone: NgZone,
    private windowRef: WindowRefService
  ) {}

  public async createScene(
    canvas: ElementRef<HTMLCanvasElement>
  ): Promise<void> {
    this.canvas = canvas.nativeElement;
    this.engine = new Engine(this.canvas, true);
    const { scene, shadowGenerator } = await setupScene(this.engine);
    const ground = setupGround(this.scene);
    const car = setupCar(scene, shadowGenerator);
    const camera = setupCamera(scene, car);
    this.scene = scene;
    this.scene.activeCamera = camera;

    this.showWorldAxis(8);
    this.showGrid(100, 10); // Add grid with labels every 10 units

    //this.loadTrack();
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = () => {
        this.scene.render();
      };

      if (this.windowRef.document.readyState !== 'loading') {
        this.engine.runRenderLoop(rendererLoopCallback);
      } else {
        this.windowRef.window.addEventListener('DOMContentLoaded', () => {
          this.engine.runRenderLoop(rendererLoopCallback);
        });
      }

      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
    });
  }

  /**
   * creates the world axes
   *
   * Source: https://doc.babylonjs.com/snippets/world_axes
   *
   * @param size number
   */
  public showWorldAxis(size: number): void {
    const makeTextPlane = (text: string, color: string, textSize: number) => {
      const dynamicTexture = new DynamicTexture(
        'DynamicTexture',
        50,
        this.scene,
        true
      );
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(
        text,
        5,
        40,
        'bold 36px Arial',
        color,
        'transparent',
        true
      );
      const plane = Mesh.CreatePlane('TextPlane', textSize, this.scene, true);
      const material = new StandardMaterial('TextPlaneMaterial', this.scene);
      material.backFaceCulling = false;
      material.specularColor = new Color3(0, 0, 0);
      material.diffuseTexture = dynamicTexture;
      plane.material = material;

      return plane;
    };

    const axisX = Mesh.CreateLines(
      'axisX',
      [
        Vector3.Zero(),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0),
        new Vector3(size * 0.95, -0.05 * size, 0),
      ],
      this.scene,
      true
    );

    axisX.color = new Color3(1, 0, 0);
    const xChar = makeTextPlane('X', 'red', size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

    const axisY = Mesh.CreateLines(
      'axisY',
      [
        Vector3.Zero(),
        new Vector3(0, size, 0),
        new Vector3(-0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0),
        new Vector3(0.05 * size, size * 0.95, 0),
      ],
      this.scene,
      true
    );

    axisY.color = new Color3(0, 1, 0);
    const yChar = makeTextPlane('Y', 'green', size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);

    const axisZ = Mesh.CreateLines(
      'axisZ',
      [
        Vector3.Zero(),
        new Vector3(0, 0, size),
        new Vector3(0, -0.05 * size, size * 0.95),
        new Vector3(0, 0, size),
        new Vector3(0, 0.05 * size, size * 0.95),
      ],
      this.scene,
      true
    );

    axisZ.color = new Color3(0, 0, 1);
    const zChar = makeTextPlane('Z', 'blue', size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
  }

  public showGrid(size: number, step: number): void {
    // Draw grid lines
    for (let i = -size; i <= size; i += step) {
      // Vertical lines (X axis)
      MeshBuilder.CreateLines(
        `gridLineX_${i}`,
        { points: [new Vector3(i, 0.01, -size), new Vector3(i, 0.01, size)] },
        this.scene
      );
      // Horizontal lines (Z axis)
      MeshBuilder.CreateLines(
        `gridLineZ_${i}`,
        { points: [new Vector3(-size, 0.01, i), new Vector3(size, 0.01, i)] },
        this.scene
      );
      // Add coordinate labels every 5 steps
      if (i % (step * 5) === 0) {
        const labelX = new DynamicTexture(`labelX_${i}`, 64, this.scene, true);
        labelX.drawText(
          i.toString(),
          5,
          40,
          'bold 24px Arial',
          'white',
          'transparent',
          true
        );
        const planeX = MeshBuilder.CreatePlane(
          `labelXPlane_${i}`,
          { size: 2 },
          this.scene
        );
        planeX.position = new Vector3(i, 0.05, -size - 2);
        const matX = new StandardMaterial(`matX_${i}`, this.scene);
        matX.diffuseTexture = labelX;
        matX.emissiveColor = new Color3(1, 1, 1);
        matX.backFaceCulling = false;
        planeX.material = matX;

        const labelZ = new DynamicTexture(`labelZ_${i}`, 64, this.scene, true);
        labelZ.drawText(
          i.toString(),
          5,
          40,
          'bold 24px Arial',
          'white',
          'transparent',
          true
        );
        const planeZ = MeshBuilder.CreatePlane(
          `labelZPlane_${i}`,
          { size: 2 },
          this.scene
        );
        planeZ.position = new Vector3(-size - 2, 0.05, i);
        const matZ = new StandardMaterial(`matZ_${i}`, this.scene);
        matZ.diffuseTexture = labelZ;
        matZ.emissiveColor = new Color3(1, 1, 1);
        matZ.backFaceCulling = false;
        planeZ.material = matZ;
      }
    }
  }

  public loadTrack(): void {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 10000, height: 10000 },
      this.scene
    );
    ground.receiveShadows = true;
    ground.position.y = -0.01; // Slightly below to avoid z-fighting

    new PhysicsAggregate(
      ground,
      PhysicsShapeType.BOX,
      { mass: 0, restitution: 0.5 },
      this.scene
    );

    ImportMeshAsync('assets/montreal.gltf', this.scene).then((result) => {
      const trackMesh = result.meshes[0];
      trackMesh.position = new Vector3(0, 1, 0);
      trackMesh.scaling = new Vector3(1, 1, 1);
      trackMesh.receiveShadows = true;
      //trackMesh.rotation = new Vector3(0, 0, Math.PI);

      new PhysicsAggregate(
        trackMesh,
        PhysicsShapeType.MESH,
        { mass: 0, restitution: 0.5, friction: 1 },
        this.scene
      );

      result.meshes.forEach((mesh) => {
        mesh.receiveShadows = true;
      });

      if (trackMesh.material) {
        (trackMesh.material as StandardMaterial).disableLighting = false;
      }
    });
  }
}
