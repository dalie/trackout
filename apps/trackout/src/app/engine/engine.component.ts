import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';

import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  imports: [],
  templateUrl: './engine.component.html',
  styleUrl: './engine.component.scss',
})
export class EngineComponent implements AfterViewInit {
  private readonly engineService = inject(EngineService);

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  async ngAfterViewInit() {
    await this.engineService.createScene(this.rendererCanvas);
    this.engineService.animate();
  }
}
