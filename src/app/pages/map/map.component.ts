import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Map } from 'maplibre-gl';
import MapLibreGlDirections, {
  LoadingIndicatorControl,
  layersFactory,
} from '@maplibre/maplibre-gl-directions';
import { HttpClient } from '@angular/common/http';
import { GeneratorService } from '../../services/generator.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
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
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
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
      const startCity = this.generatorForm.controls.startCity.value!;
      const endCity = this.generatorForm.controls.endCity.value!;

      const start = await this.generatorService.convertCity(startCity);
      const end = await this.generatorService.convertCity(endCity);

      this.waypoints = this.generatorService.createRoute(start, end);
    } catch (error) {
      console.error('Error converting cities:', error);
    }
  }
}

/*import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Map, NavigationControl } from 'maplibre-gl';
import MapLibreGlDirections, {
  LoadingIndicatorControl,
  layersFactory,
} from '@maplibre/maplibre-gl-directions';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {
  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  showModal: boolean = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  startCity: string = '';
  endCity: string = '';
  result: any = null;

  public generatorForm = new FormGroup({
    startCity: new FormControl('', Validators.required),
    endCity: new FormControl('', Validators.required),
  });

  startLatitude: string = '';
  startLongitude: string = '';
  endLatitude: string = '';
  endLongitude: string = '';

  directions!: MapLibreGlDirections;
  initialState: [number, number] | null = null;
  map!: Map;

  waypoints: [number, number][] = [];

  constructor(private http: HttpClient) {
    this.setLocation();
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
      await this.convertCity(
        this.generatorForm.controls.startCity.value!,
        'start'
      );
      await this.convertCity(this.generatorForm.controls.endCity.value!, 'end');
      this.result = {
        startLatitude: this.startLatitude,
        startLongitude: this.startLongitude,
        endLatitude: this.endLatitude,
        endLongitude: this.endLongitude,
      };
      this.createRoute();
    } catch (error) {
      console.error('Error converting cities:', error);
    }
  }

  private async convertCity(city: string, type: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
        )
      );
      if (response && response.length > 0) {
        if (type === 'start') {
          this.startLatitude = response[0].lat;
          this.startLongitude = response[0].lon;
        } else {
          this.endLatitude = response[0].lat;
          this.endLongitude = response[0].lon;
        }
      } else {
        console.error(`No results found for ${city}`);
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
    }
  }

  createRoute(): void {
    if (this.result) {
      this.waypoints = [
        [parseFloat(this.startLongitude), parseFloat(this.startLatitude)],
        [parseFloat(this.endLongitude), parseFloat(this.endLatitude)],
      ];

      console.log('Waypoints:', this.waypoints);
      this.map.setCenter(this.waypoints[0]);
      this.directions.setWaypoints(this.waypoints);
    } else {
      console.error('Invalid coordinates');
    }
  }
}*/
