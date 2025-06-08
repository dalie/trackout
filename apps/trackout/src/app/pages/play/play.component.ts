import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiComponent } from "../../ui/ui.component";
import { EngineComponent } from "../../engine/engine.component";

@Component({
  selector: 'app-play',
  imports: [CommonModule, UiComponent, EngineComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayComponent {}
