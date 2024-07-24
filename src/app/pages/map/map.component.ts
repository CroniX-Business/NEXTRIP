import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Map, Marker, Popup } from 'maplibre-gl';
import {
  LoadingIndicatorControl,
  layersFactory,
} from '@maplibre/maplibre-gl-directions';
import { GeneratorService } from '../../services/generator.service';
import { environment } from '../../../environments/environment';
import CustomMapLibreGlDirections from './custom-directions';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  MAP_STYLE_API: string = environment.MAP_STYLE_API;
  MAP_STYLE_JSON: string = environment.MAP_STYLE_JSON;

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  map!: Map;
  directions!: CustomMapLibreGlDirections;
  initialState: [number, number] = [0, 0];
  showModal: boolean = false;

  generatorForm: FormGroup<{
    startCity: FormControl<string | null>;
    endCity: FormControl<string | null>;
  }>;

  constructor(private generatorService: GeneratorService) {
    this.generatorForm = new FormGroup({
      startCity: new FormControl('', Validators.required),
      endCity: new FormControl('', Validators.required),
    });
  }

  myLocation() {
    this.setLocation();
    this.setUserMarker();
    this.map.flyTo({
      center: this.initialState!,
      zoom: 11,
    });
  }

  openModal() {
    this.showModal = !this.showModal;
  }

  async ngAfterViewInit() {
    this.mapContainer.nativeElement.classList.add('loader');
    await this.initializeMap();
  }

  async initializeMap() {
    try {
      await this.setLocation();

      if (this.initialState) {
        this.map = new Map({
          container: this.mapContainer.nativeElement,
          style: `${this.MAP_STYLE_JSON}?apiKey=${this.MAP_STYLE_API}`,
          zoom: 11,
          minZoom: 2,
          center: this.initialState,
          fadeDuration: 0,
          attributionControl: false,
        });

        const layers = layersFactory();
        layers.push({
          id: 'maplibre-gl-directions-waypoint-label',
          type: 'symbol',
          source: 'maplibre-gl-directions',
          layout: {
            'text-field': [
              'case',
              ['==', ['get', 'category'], 'ORIGIN'],
              'A',
              ['==', ['get', 'category'], 'DESTINATION'],
              'B',
              '',
            ],
          },
          paint: {
            'text-color': '#ffffff',
            'text-opacity': 0.7,
          },
          filter: [
            'all',
            ['==', ['geometry-type'], 'Point'],
            ['==', ['get', 'type'], 'WAYPOINT'],
            ['in', ['get', 'category'], ['literal', ['ORIGIN', 'DESTINATION']]],
          ],
        });

        this.setUserMarker();

        this.map.on('load', () => {
          this.directions = new CustomMapLibreGlDirections(this.map, {
            requestOptions: {
              alternatives: 'false',
            },
            layers,
          });

          this.directions.interactive = true;
          this.map.addControl(new LoadingIndicatorControl(this.directions));

          this.mapContainer.nativeElement.classList.remove('loader');
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async setLocation() {
    try {
      this.initialState = await this.getLocation();
    } catch (error) {
      console.error(error);
    }
  }
  setUserMarker() {
    const UserInfo = new Popup({ offset: 25 }).setText('Your location');

    new Marker({
      color: '#b74de8',
    })
      .setLngLat(this.initialState)
      .setPopup(UserInfo)
      .addTo(this.map);
  }

  getLocation(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;
            resolve([longitude, latitude]);
          },
          (error) => {
            reject(`Geolocation error: ${error.message}`);
          }
        );
      } else {
        reject('No support for geolocation');
      }
    });
  }

  generateTrip(): void {
    this.generatorService
      .generateRoute(this.directions.waypointsFeatures)
      .subscribe({
        next: (response) => {
          console.log('Trip generated successfully', response);
          this.directions.interactive = false;
        },
        error: (error) => {
          console.error('Error generating trip', error);
        },
      });
  }

  saveTrip(): void {}
}
