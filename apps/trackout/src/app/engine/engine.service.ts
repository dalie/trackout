import { ElementRef, Injectable, NgZone } from '@angular/core';
import { Engine, Scene } from '@babylonjs/core';
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
}
