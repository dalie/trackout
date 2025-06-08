import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui',
  imports: [CommonModule],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiComponent {}
