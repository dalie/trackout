import { Component } from '@angular/core';
import { DeckComponent } from './deck/deck.component';

@Component({
  imports: [DeckComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
