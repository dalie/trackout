import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  imports: [CommonModule],
  templateUrl: './engine.component.html',
  styleUrl: './engine.component.scss',
})
export class EngineComponent implements AfterViewInit {
  private readonly engineService = inject(EngineService);

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.engineService.createScene(this.rendererCanvas);
    this.engineService.animate();
  }
}
