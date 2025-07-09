import { ChangeDetectionStrategy, Component } from '@angular/core';

import { UiComponent } from "../../ui/ui.component";
import { EngineComponent } from "../../engine/engine.component";

@Component({
  selector: 'app-play',
  imports: [UiComponent, EngineComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayComponent {}
