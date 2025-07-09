import { ChangeDetectionStrategy, Component } from '@angular/core';


@Component({
  selector: 'app-ui',
  imports: [],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiComponent {}
