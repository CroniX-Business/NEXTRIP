import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Map } from 'maplibre-gl';
import MapLibreGlDirections, {
  LoadingIndicatorControl,
  layersFactory,
} from '@maplibre/maplibre-gl-directions';
import { HttpClient } from '@angular/common/http';
import { GeneratorService } from '../../services/generator.service';
import { environment } from '../../../environments/environment';
import { EMPTY, catchError, combineLatest } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  showModal: boolean = false;
  generatorForm: FormGroup;

  waypoints: [number, number][] = [];
  initialState: [number, number] | null = null;

  map!: Map;
  directions!: MapLibreGlDirections;

  constructor(
    private generatorService: GeneratorService,
    private http: HttpClient
  ) {
    this.generatorForm = new FormGroup({
      startCity: new FormControl('', Validators.required),
      endCity: new FormControl('', Validators.required),
    });
    this.setLocation();
  }

  openModal() {
    this.showModal = !this.showModal;
  }

  myLocation() {
    this.setLocation();
    this.map.setCenter(this.initialState!);
  }

  async ngAfterViewInit() {
    await this.initializeMap();
  }

  async initializeMap() {
    try {
      await this.setLocation();

      if (this.initialState) {
        const MAP_STYLE_API = environment.MAP_STYLE_API;
        const MAP_STYLE_JSON = environment.MAP_STYLE_JSON;

        this.map = new Map({
          container: this.mapContainer.nativeElement,
          style: `${MAP_STYLE_JSON}?apiKey=${MAP_STYLE_API}`,
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

        this.map.on('load', () => {
          this.directions = new MapLibreGlDirections(this.map, {
            requestOptions: {
              alternatives: 'true',
            },
            layers,
          });

          this.directions.interactive = true;
          this.map.addControl(new LoadingIndicatorControl(this.directions));
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

  async convertCities(): Promise<void> {
    try {
      const startCity = this.generatorForm.controls['startCity'].value!;
      const endCity = this.generatorForm.controls['endCity'].value!;

      combineLatest([
        this.generatorService.convertCity(startCity),
        this.generatorService.convertCity(endCity),
      ])
        .pipe(
          catchError((error) => {
            console.error('Error converting cities:', error);
            return EMPTY; // Return an empty observable to prevent breaking the stream
          })
        )
        .subscribe({
          next: ([start, end]) => {
            this.generatorService.generateRoute(start, end).subscribe({
              next: (waypoints) => {
                this.map.setCenter(waypoints[0]);
                this.directions.setWaypoints(waypoints);
              },
              error: (error) => {
                console.error('Error generating route:', error);
              },
            });
          },
        });
    } catch (error) {
      console.error('Error converting cities:', error);
    }
  }
}
