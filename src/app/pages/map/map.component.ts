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

  checkboxLabels = [
    'restaurant', // Everyone needs to eat, and finding good restaurants is a common trip priority
    'museum', // Popular cultural activity, often a key part of sightseeing
    'art_gallery', // Another cultural highlight, often visited by tourists
    'park', // A great spot for relaxation and enjoying nature during a trip
    'amusement_park', // Fun activities, especially if traveling with family
    'night_club', // Popular for nightlife activities
    'tourist_attraction', // Covers a broad range of popular destinations
  ];

  generatorParamsForm = new FormGroup({
    restaurant: new FormControl(false),
    museum: new FormControl(false),
    art_gallery: new FormControl(false),
    park: new FormControl(false),
    amusement_park: new FormControl(false),
    night_club: new FormControl(false),
    tourist_attraction: new FormControl(false),
    radius: new FormControl(),
    rating: new FormControl(4.6),
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

  radiusValue: string = '1500';

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleModalParams() {
    this.showModalParams = !this.showModalParams;
  }

  toggleModalSave() {
    this.showModalSaveTrip = !this.showModalSaveTrip;
  }

  changeRadius(event: Event) {
    this.radiusValue = (event.target as HTMLInputElement).value;
  }

  formatLabel(label: string): string {
    return label.replace(/_/g, ' ');
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

          this.directions.on('addwaypoint', (e) => {
            if (e.data && e.data.index !== undefined && e.data.index >= 5) {
              alert('Maksimalno 5 lokacija');
              this.directions.removeWaypoint(e.data.index);
            }
          });
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
        restaurant: this.generatorParamsForm.controls.restaurant.value,
        museum: this.generatorParamsForm.controls.museum.value,
        art_gallery: this.generatorParamsForm.controls.art_gallery.value,
        park: this.generatorParamsForm.controls.park.value,
        amusement_park: this.generatorParamsForm.controls.amusement_park.value,
        night_club: this.generatorParamsForm.controls.night_club.value,
        tourist_attraction:
          this.generatorParamsForm.controls.tourist_attraction.value,
      },
      radius: this.generatorParamsForm.controls.radius.value,
      rating: this.generatorParamsForm.controls.rating.value,
    };

    if (this.user) {
      this.generatorService
        .generateRoute(
          this.directions.waypointsFeatures,
          generatorParams,
          this.user?._id,
        )
        .subscribe({
          next: (response) => {
            this.updateTokens();
            console.log(response);
            this.handleTripGenerationSuccess(response);
          },
          error: (error) => {
            console.error('Error generating trip', error);
          },
        });
    }
  }

  private updateTokens() {
    this.getUserInfo();
    setTimeout(() => {
      if (this.user) {
        const newTokenCount = this.user?.tokens;
        this.generatorService.updateTokens(newTokenCount);
      }
    }, 1000);
  }

  private handleTripGenerationSuccess(response: Place[]): void {
    this.places = response;
    this.cdr.markForCheck();

    this.toggleModalParams();

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
    this.map.flyTo({
      center: waypoints[0],
      zoom: 11,
    });
    this.directions.setWaypoints(waypoints);
  }

  setPlaceMarker(): void {
    this.places?.forEach((place, index) => {
      if (place.location) {
        const el = document.createElement('div');
        el.className = 'marker';

        const photoReference = place.photos?.[0]?.name.split('/').pop();

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
    if (this.places) {
      this.directions.clear();

      this.markers.forEach((marker) => marker.remove());
      this.markers = [];

      this.places = [];

      this.directions.interactive = true;
    }
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
            this.toggleModalSave();
            this.cdr.detectChanges();
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
