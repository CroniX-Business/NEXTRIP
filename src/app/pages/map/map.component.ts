import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Map, Marker, Popup } from 'maplibre-gl';
import {
  LoadingIndicatorControl,
  layersFactory,
} from '@maplibre/maplibre-gl-directions';
import { GeneratorService } from '../../services/generator.service';
import { environment } from '../../../environments/environment';
import CustomMapLibreGlDirections from './custom-directions';
import { generatorParams, Place } from '../../models/Generator';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';

('../assets/map/images/direction-arrow.png?url');

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

  checkboxLabels = ['bar', 'restaurant', 'museum'];

  generatorParamsForm = new FormGroup({
    bar: new FormControl(false),
    restaurant: new FormControl(false),
    museum: new FormControl(false),
  });

  saveTripNameForm = new FormGroup({
    tripName: new FormControl(''),
  });

  constructor(
    private generatorService: GeneratorService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.getUserInfo();
    this.places = this.generatorService.getPlacesFromTrip();
  }

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  map!: Map;
  directions!: CustomMapLibreGlDirections;
  initialState: [number, number] = [0, 0];

  user: User | null = null;
  places: Place[] | null = null;
  markers: Marker[] = [];

  isCollapsed: boolean = false;
  showModalParams: boolean = false;
  showModalSaveTrip: boolean = false;

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleModalParams() {
    this.showModalParams = !this.showModalParams;
  }

  toggleModalSave() {
    console.log(this.showModalSaveTrip);
    this.showModalSaveTrip = !this.showModalSaveTrip;
    console.log(this.showModalSaveTrip);
  }

  myLocation() {
    this.setLocation();
    this.setUserMarker();
    this.map.flyTo({
      center: this.initialState!,
      zoom: 11,
    });
  }

  getUserInfo(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  getOpeningHoursDescription(place: Place): string {
    const dayIndex = new Date().getDay();
    return (
      place.currentOpeningHours?.weekdayDescriptions?.[dayIndex] ||
      'Hours not available'
    );
  }

  async ngAfterViewInit() {
    this.mapContainer.nativeElement.classList.add('loader');
    await this.initializeMap();
    setTimeout(() => {
      if (this.places && this.places.length > 0) {
        this.handleTripGenerationSuccess(this.places);
      }
    }, 1000);
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
          this.mapContainer.nativeElement.classList.remove('loader');
          this.directions = new CustomMapLibreGlDirections(this.map, {
            requestOptions: {
              alternatives: 'false',
              overview: 'full',
              steps: 'true',
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
          },
        );
      } else {
        reject('No support for geolocation');
      }
    });
  }

  openModalGenerateTrip(): void {
    this.toggleModalParams();
  }

  openModalSaveTrip(): void {
    this.toggleModalSave();
  }

  generateTrip(): void {
    const generatorParams: generatorParams = {
      typeOfTrip: {
        bar: this.generatorParamsForm.controls.bar.value,
        restaurant: this.generatorParamsForm.controls.restaurant.value,
        museum: this.generatorParamsForm.controls.museum.value,
      },
      radius: 1600,
    };

    this.generatorService
      .generateRoute(this.directions.waypointsFeatures, generatorParams)
      .subscribe({
        next: (response) => {
          this.handleTripGenerationSuccess(response);
        },
        error: (error) => {
          console.error('Error generating trip', error);
        },
      });
  }

  private handleTripGenerationSuccess(response: Place[]): void {
    this.places = response;
    this.cdr.markForCheck();

    this.directions.clear();
    this.directions.interactive = false;

    const waypoints: [number, number][] = response
      .filter(
        (
          locationObj,
        ): locationObj is Place & {
          location: { longitude: number; latitude: number };
        } => !!locationObj.location,
      )
      .map((locationObj) => [
        locationObj.location.longitude,
        locationObj.location.latitude,
      ]);

    this.setPlaceMarker();
    this.directions.setWaypoints(waypoints);
  }

  setPlaceMarker(): void {
    this.places?.forEach((place, index) => {
      if (place.location) {
        const el = document.createElement('div');
        el.className = 'marker';

        const photoReference = place.photos?.[0]?.name.split('/').pop();

        // Construct the image URL using the photo reference and Google Place Photos API
        const imageUrl = photoReference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photo_reference=${photoReference}&key=${environment.GOOGLE_PLACES_API}`
          : `https://picsum.photos/seed/${index + 1}/60/60`;

        el.style.backgroundImage = `url(${imageUrl})`;
        el.style.width = '45px';
        el.style.height = '45px';
        el.style.backgroundSize = 'cover';
        el.style.borderRadius = '30%';
        el.style.display = 'inline-block';
        el.style.overflow = 'hidden';

        const popupContent = `
          <div class="p-4 max-w-xs">
            <strong class="text-lg">${index + 1}. ${
              place.displayName.text
            }</strong><br>
            <strong>Rating:</strong> ${place.rating} ⭐<br>
            <strong>Address:</strong> ${place.formattedAddress || 'N/A'}<br>
            <strong>Open Now:</strong> ${
              place.currentOpeningHours?.openNow ? 'Yes' : 'No'
            }<br>
            ${
              place.currentOpeningHours?.weekdayDescriptions?.[
                new Date().getDay()
              ] || ''
            }<br>
            <div class="mt-4 flex overflow-x-auto space-x-4">
              ${place.photos
                ?.map((photo) => {
                  const photoReference = photo.name.split('/').pop();
                  return `
                  <img 
                    src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=150&photo_reference=${photoReference}&key=${environment.GOOGLE_PLACES_API}"
                    class="w-36 h-24 object-cover rounded-md shadow-sm"
                  />`;
                })
                .join('')}
            </div>
          </div>
        `;

        const popup = new Popup({ offset: 25 }).setHTML(popupContent);

        const marker = new Marker({ element: el })
          .setLngLat([place.location.longitude, place.location.latitude])
          .setPopup(popup)
          .addTo(this.map);

        this.markers.push(marker);
      }
    });
  }

  clearTrip(): void {
    this.directions.clear();

    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    this.places = [];

    this.directions.interactive = true;
  }

  saveTrip(): void {
    if (
      this.places &&
      this.user &&
      this.saveTripNameForm.controls.tripName.value
    ) {
      this.generatorService
        .saveRoute(
          this.user?._id,
          this.places,
          this.saveTripNameForm.controls.tripName.value,
        )
        .subscribe({
          next: (success) => {
            this.toggleModalSave()
            this.cdr.detectChanges()
            if (success) {
              console.log('Trip saved successfully!');
            } else {
              console.log('Failed to save trip.');
            }
          },
          error: (err) => {
            console.error('Error saving trip:', err);
            alert('An error occurred while saving the trip.');
          },
        });
    }
  }
}
