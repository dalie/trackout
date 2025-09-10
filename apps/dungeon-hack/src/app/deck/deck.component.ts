import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { lineString, nearestPointOnLine, point } from '@turf/turf';

@Component({
  selector: 'app-deck',
  imports: [CommonModule],
  templateUrl: './deck.component.html',
  styleUrl: './deck.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckComponent implements AfterViewInit {
  @ViewChild('deck', { static: true })
  private readonly deckElement: ElementRef<HTMLCanvasElement> | undefined;
  private deck: Deck | undefined;
  private center = signal([0, 0]);
  private mouseAngle = signal(0);
  private keyPressed: Set<string> = new Set();
  private characterIcons = [
    {
      name: 'Character',
      icon: 'blue_body_circle',
      size: 16,
      zIndex: 1,
    },
    {
      name: 'Character',
      icon: 'face_b',
      size: 6,
      zIndex: 2,
    },
  ];

  ngAfterViewInit(): void {
    if (this.deckElement) {
      this.deck = new Deck({
        canvas: this.deckElement.nativeElement,

        initialViewState: {
          longitude: 0,
          latitude: 0,
          zoom: 16,
          pitch: 0,
          bearing: 0,
        },
        onHover: (info, event) => {
          const coords = info.coordinate as [number, number] | null;
          const center = this.center();

          if (!coords || !center) return;

          // Calculate the angle in radians
          const angle = Math.atan2(
            coords[1] - center[1],
            coords[0] - center[0]
          );
          this.mouseAngle.set((angle * 180) / Math.PI - 270);
        },

        controller: {
          doubleClickZoom: false,
          dragPan: false,
          dragRotate: false,
          keyboard: false,
          scrollZoom: false,
          touchRotate: false,
          touchZoom: false,
        },

        layers: [],
      });

      window.addEventListener('blur', () => {
        this.keyPressed.clear();
      });
      window.addEventListener('keyup', (event) => {
        this.keyPressed.delete(event.key);
      });

      window.addEventListener('keydown', (event) => {
        this.keyPressed.add(event.key);
      });
      this.animationLoop();
    }
  }

  getCharacterLayers() {
    const layer = new GeoJsonLayer({
      id: 'GeoJsonLayer',
      data: '/assets/map.json',
      pickable: true,

      getFillColor: [0, 100, 0, 200],
    });

    const characterLayer = new IconLayer({
      id: 'character-layer',
      data: this.characterIcons,
      iconAtlas: 'assets/character_sprite.png',
      iconMapping: 'assets/character_sprite.json',
      sizeScale: 3,
      sizeUnits: 'meters',
      getIcon: (d) => d.icon,
      getPosition: (d) => {
        return [...this.center(), d.zIndex] as [number, number, number];
      },
      getSize: (d) => d.size,
      getAngle: () => this.mouseAngle(),
      updateTriggers: {
        getPosition: Math.random(),
        getAngle: this.mouseAngle(),
      },
    });
    return [layer, characterLayer];
  }

  updateCenter() {
    const centerPixel = [
      (this.deckElement?.nativeElement.clientWidth || 0) / 2,
      (this.deckElement?.nativeElement.clientHeight || 0) / 2,
    ];

    const centerCoord = [...this.center()];

    if (this.keyPressed.size > 0) {
      const offset = 0.00005;
      if (this.keyPressed.has('a') || this.keyPressed.has('ArrowLeft')) {
        centerCoord[0] -= offset;
      }
      if (this.keyPressed.has('d') || this.keyPressed.has('ArrowRight')) {
        centerCoord[0] += offset;
      }
      if (this.keyPressed.has('s') || this.keyPressed.has('ArrowDown')) {
        centerCoord[1] -= offset;
      }
      if (this.keyPressed.has('w') || this.keyPressed.has('ArrowUp')) {
        centerCoord[1] += offset;
      }
    }

    if (
      centerCoord[0] !== this.center()[0] ||
      centerCoord[1] !== this.center()[1]
    ) {
      const newCenterPixel = this.deck?.getViewports()[0].project(centerCoord);
      if (!newCenterPixel) {
        return;
      }

      const hits = this.deck?.pickObject({
        x: newCenterPixel[0],
        y: newCenterPixel[1],
        radius: 1,
        layerIds: ['GeoJsonLayer'],
      });

      if (hits?.object) {
        const p = point(centerCoord);
        const l = lineString(hits.object.geometry.coordinates[0]);
        const snapped = nearestPointOnLine(l, p);

        centerCoord[0] = snapped.geometry.coordinates[0];
        centerCoord[1] = snapped.geometry.coordinates[1];
      }
      this.center.set(centerCoord);
    }
  }
  renderLayers() {
    this.updateCenter();

    const center = this.center();
    const characterLayers = this.getCharacterLayers();

    this.deck?.setProps({
      viewState: {
        latitude: center[1],
        longitude: center[0],
        zoom: 16,
        pitch: 0,
        bearing: 0,
      },
      layers: [...characterLayers],
    });
  }
  animationLoop() {
    this.renderLayers();
    requestAnimationFrame(this.animationLoop.bind(this));
  }
}
