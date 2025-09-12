import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
  private center = [0, 0];
  private mouseAngle = 0;
  private keyPressed: Set<string> = new Set();
  private actionDuration = 200;
  private actionStart: number | null = null;
  private actionAngle = 0;
  private actionTargetAngle = -90;
  private characterIcons = [
    {
      name: 'Character',
      icon: 'body',
      size: 128,
      zIndex: 1,
    },
    {
      name: 'CharacterFace',
      icon: 'eyes',
      zIndex: 4,
    },
    {
      name: 'CharacterLeftHand',
      icon: 'hand_left',
      size: 128,
      zIndex: 3,
    },
    {
      name: 'CharacterRighHand',
      icon: 'hand_right',
      size: 128,
      zIndex: 3,
      isAction: true,
    },
    {
      name: 'CharacterWeapon',
      icon: 'pickaxe',
      size: 128,
      zIndex: 2,
      isAction: true,
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
        onClick: (info) => {
          if (this.actionStart === null) {
            this.actionStart = Date.now();
          }
        },
        onHover: (info, event) => {
          const coords = info.coordinate as [number, number] | null;
          const center = this.center;

          if (!coords || !center) return;

          // Calculate the angle in radians
          const angle = Math.atan2(
            coords[1] - center[1],
            coords[0] - center[0]
          );
          this.mouseAngle = (angle * 180) / Math.PI - 270;
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
      sizeScale: 3,
      sizeUnits: 'meters',
      getIcon: (d) => ({
        url: `/assets/${d.icon}.png`,
        width: 256,
        height: 256,
      }),
      getPosition: (d) => {
        return [...this.center, d.zIndex] as [number, number, number];
      },
      getSize: (d) => d.size,

      getAngle: (d) => this.mouseAngle + (d.isAction ? this.actionAngle : 0),
      updateTriggers: {
        getPosition: Math.random(),
        getAngle: this.mouseAngle + this.actionAngle,
      },
    });
    return [characterLayer, layer];
  }

  updateCenter() {
    const centerCoord = [...this.center];

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
      centerCoord[0] !== this.center[0] ||
      centerCoord[1] !== this.center[1]
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
      this.center = centerCoord;
    }
  }

  updateAction() {
    if (this.actionStart) {
      const delta = Date.now() - this.actionStart;
      const progress = delta / this.actionDuration;

      if (progress > 1) {
        this.actionAngle = 0;
        this.actionStart = null;
        return;
      }

      if (progress > 0.5) {
        const half = this.actionTargetAngle / 2;
        this.actionAngle = half - (this.actionTargetAngle * progress - half);
        return;
      }

      this.actionAngle = this.actionTargetAngle * progress;
    }
  }

  renderLayers() {
    this.updateCenter();
    this.updateAction();

    const center = this.center;
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
