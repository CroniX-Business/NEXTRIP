// import { CommonModule } from '@angular/common';
// import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { Map, Marker, Popup } from 'maplibre-gl';
// import {
//   LoadingIndicatorControl,
//   layersFactory,
// } from '@maplibre/maplibre-gl-directions';
// import { GeneratorService } from '../../services/generator.service';
// import { environment } from '../../../environments/environment';
// import CustomMapLibreGlDirections from './custom-directions';
// import { generatorParams, Place } from '../../models/Generator';
// import { User } from '../../models/User';
// import { AuthService } from '../../services/auth.service';
// import { BehaviorSubject } from 'rxjs';

// ('../assets/map/images/direction-arrow.png?url');

// @Component({
//   selector: 'app-map',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './map.component.html',
//   styleUrls: ['./map.component.css'],
// })
// export class MapComponent implements AfterViewInit {
//   MAP_STYLE_API: string = environment.MAP_STYLE_API;
//   MAP_STYLE_JSON: string = environment.MAP_STYLE_JSON;

//   map!: Map;
//   directions!: CustomMapLibreGlDirections;
//   initialState: [number, number] = [0, 0];

//   public user$ = new BehaviorSubject<User | null>(null);
//   public places$ = new BehaviorSubject<Place[]>([]);
//   markers: Marker[] = [];

//   editMode: boolean = false;

//   isCollapsed: boolean = false;
//   showModalParams: boolean = false;
//   showModalSaveTrip: boolean = false;
//   isTokenModalOpen: boolean = false;

//   radiusValue: string = '1500';

//   checkboxLabels = [
//     'restaurant',
//     'museum',
//     'art_gallery',
//     'park',
//     'amusement_park',
//     'night_club',
//     'tourist_attraction',
//   ];

//   generatorParamsForm = new FormGroup({
//     restaurant: new FormControl(false),
//     museum: new FormControl(false),
//     art_gallery: new FormControl(false),
//     park: new FormControl(false),
//     amusement_park: new FormControl(false),
//     night_club: new FormControl(false),
//     tourist_attraction: new FormControl(false),
//     radius: new FormControl(1500),
//     rating: new FormControl(4.6),
//   });

//   saveTripNameForm = new FormGroup({
//     tripName: new FormControl(''),
//   });

//   constructor(
//     private generatorService: GeneratorService,
//     private authService: AuthService,
//   ) {
//     this.getUserInfo();
//     this.places$.next(this.generatorService.getPlacesFromTrip());
//   }

//   @ViewChild('map')
//   private mapContainer!: ElementRef<HTMLElement>;

//   @ViewChild('modal')
//   private modal!: ElementRef;
//   @ViewChild('modalImage')
//   private modalImage!: ElementRef<HTMLImageElement>;

//   toggleCollapse() {
//     this.isCollapsed = !this.isCollapsed;
//   }

//   toggleModalParams() {
//     this.showModalParams = !this.showModalParams;
//   }

//   toggleModalSave() {
//     this.showModalSaveTrip = !this.showModalSaveTrip;
//   }

//   toggleModalWarning() {
//     this.isTokenModalOpen = !this.isTokenModalOpen;
//   }

//   openImageResizeModal(imageUrl: string): void {
//     this.modal.nativeElement.style.display = 'block';
//     this.modalImage.nativeElement.src = imageUrl;
//   }

//   closeImageResizeModal(): void {
//     this.modal.nativeElement.style.display = 'none';
//   }

//   changeRadius(event: Event) {
//     this.radiusValue = (event.target as HTMLInputElement).value;
//   }

//   formatLabel(label: string): string {
//     return label.replace(/_/g, ' ');
//   }

//   myLocation() {
//     this.setLocation();
//     this.setUserMarker();
//     this.map.flyTo({
//       center: this.initialState!,
//       zoom: 11,
//     });
//   }

//   getUserInfo() {
//     this.authService.getUserInfo().subscribe({
//       next: (user) => {
//         this.user$.next(user);
//       },
//       error: (error) => {
//         console.error('Error fetching user information:', error);
//       },
//     });
//   }

//   getOpeningHoursDescription(place: Place): string {
//     const dayIndex = new Date().getDay();
//     return (
//       place.currentOpeningHours?.weekdayDescriptions?.[dayIndex] ||
//       'Hours not available'
//     );
//   }

//   async ngAfterViewInit() {
//     const places = this.places$.getValue();
//     this.mapContainer.nativeElement.classList.add('loader');
//     await this.initializeMap();
//     setTimeout(() => {
//       if (places && places.length > 0) {
//         this.handleTripGenerationSuccess(places);
//       }
//     }, 1000);
//   }

//   async initializeMap() {
//     try {
//       await this.setLocation();

//       if (this.initialState) {
//         this.map = new Map({
//           container: this.mapContainer.nativeElement,
//           style: `${this.MAP_STYLE_JSON}?apiKey=${this.MAP_STYLE_API}`,
//           zoom: 11,
//           minZoom: 2,
//           center: this.initialState,
//           fadeDuration: 0,
//           attributionControl: false,
//         });

//         const layers = layersFactory();
//         layers.push({
//           id: 'maplibre-gl-directions-waypoint-label',
//           type: 'symbol',
//           source: 'maplibre-gl-directions',
//           layout: {
//             'text-field': [
//               'case',
//               ['==', ['get', 'category'], 'ORIGIN'],
//               'A',
//               ['==', ['get', 'category'], 'DESTINATION'],
//               'B',
//               '',
//             ],
//           },
//           paint: {
//             'text-color': '#ffffff',
//             'text-opacity': 0.7,
//           },
//           filter: [
//             'all',
//             ['==', ['geometry-type'], 'Point'],
//             ['==', ['get', 'type'], 'WAYPOINT'],
//             ['in', ['get', 'category'], ['literal', ['ORIGIN', 'DESTINATION']]],
//           ],
//         });

//         this.setUserMarker();

//         this.map.on('load', () => {
//           this.mapContainer.nativeElement.classList.remove('loader');
//           this.directions = new CustomMapLibreGlDirections(this.map, {
//             requestOptions: {
//               alternatives: 'false',
//               overview: 'full',
//               steps: 'true',
//             },
//             layers,
//           });

//           this.directions.interactive = true;
//           this.map.addControl(new LoadingIndicatorControl(this.directions));

//           this.directions.on('addwaypoint', (e) => {
//             if (e.data && e.data.index !== undefined) {
//               if (e.data.index >= 5) {
//                 alert('Max 5 locations');
//                 this.directions.removeWaypoint(e.data.index);
//               }

//               if (this.editMode) {
//                 alert('Cannot add locations in edit mode');
//                 this.directions.removeWaypoint(e.data.index);
//               }
//             }
//           });

//           // this.directions.on('removewaypoint', (e) => {
//           //   if (e.data && e.data.index !== undefined) {
//           //     if (this.editMode) {
//           //       console.log(e.data.index)
//           //       this.removePoint(e.data.index)
//           //     }
//           //   }
//           // });
//         });
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   async setLocation() {
//     try {
//       this.initialState = await this.getLocation();
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   setUserMarker() {
//     const UserInfo = new Popup({ offset: 25 }).setText('Your location');

//     new Marker({
//       color: '#b74de8',
//     })
//       .setLngLat(this.initialState)
//       .setPopup(UserInfo)
//       .addTo(this.map);
//   }

//   getLocation(): Promise<[number, number]> {
//     return new Promise((resolve, reject) => {
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             const longitude = position.coords.longitude;
//             const latitude = position.coords.latitude;
//             resolve([longitude, latitude]);
//           },
//           (error) => {
//             reject(`Geolocation error: ${error.message}`);
//           },
//         );
//       } else {
//         reject('No support for geolocation');
//       }
//     });
//   }

//   openModalGenerateTrip(): void {
//     this.toggleModalParams();
//   }

//   openModalSaveTrip(): void {
//     this.toggleModalSave();
//   }

//   openModalWarning(): void {
//     this.toggleModalWarning();
//   }

//   checkTokens(): boolean {
//     const currentUser = this.user$.getValue();
//     if (this.user$.getValue() && this.user$.getValue()?.tokens <= 0) {
//       this.openModalWarning();
//       return true;
//     }
//     return false;
//   }

//   generateTrip(): void {
//     if (this.checkTokens()) return;

//     const currentUser = this.user$.getValue();

//     const generatorParams: generatorParams = {
//       typeOfTrip: {
//         restaurant: this.generatorParamsForm.controls.restaurant.value,
//         museum: this.generatorParamsForm.controls.museum.value,
//         art_gallery: this.generatorParamsForm.controls.art_gallery.value,
//         park: this.generatorParamsForm.controls.park.value,
//         amusement_park: this.generatorParamsForm.controls.amusement_park.value,
//         night_club: this.generatorParamsForm.controls.night_club.value,
//         tourist_attraction:
//           this.generatorParamsForm.controls.tourist_attraction.value,
//       },
//       radius: this.generatorParamsForm.controls.radius.value,
//       rating: this.generatorParamsForm.controls.rating.value,
//     };

//     if (currentUser) {
//       this.generatorService
//         .generateRoute(
//           this.directions.waypointsFeatures,
//           generatorParams,
//           currentUser._id,
//         )
//         .subscribe({
//           next: (response) => {
//             this.updateTokens();
//             this.handleTripGenerationSuccess(response);
//           },
//           error: (error) => {
//             console.error('Error generating trip', error);
//           },
//         });
//     }
//   }

//   private updateTokens() {
//     this.getUserInfo();
//     const currentUser = this.user$.getValue();
//     setTimeout(() => {
//       if (currentUser) {
//         const newTokenCount = currentUser.tokens;
//         console.log(newTokenCount);
//         this.generatorService.updateTokens(newTokenCount);
//       }
//     }, 1000);
//   }

//   private handleTripGenerationSuccess(response: Place[]): void {
//     this.places$.next(response);

//     this.toggleModalParams();

//     this.directions.clear();
//     this.directions.interactive = false;

//     const waypoints: [number, number][] = response
//       .filter(
//         (
//           locationObj,
//         ): locationObj is Place & {
//           location: { longitude: number; latitude: number };
//         } => !!locationObj.location,
//       )
//       .map((locationObj) => [
//         locationObj.location.longitude,
//         locationObj.location.latitude,
//       ]);

//     this.setPlaceMarker();
//     this.map.flyTo({
//       center: waypoints[0],
//       zoom: 11,
//     });
//     this.directions.setWaypoints(waypoints);
//   }

//   setPlaceMarker(): void {
//     const places = this.places$.getValue();
//     places.forEach((place, index) => {
//       if (place.location) {
//         const el = document.createElement('div');
//         el.className = 'marker';

//         const photoReference = place.photos?.[0]?.name.split('/').pop();
//         const imageUrl = photoReference
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photo_reference=${photoReference}&key=${environment.GOOGLE_PLACES_API}`
//           : `https://picsum.photos/seed/${index + 1}/60/60`;

//         el.style.backgroundImage = `url(${imageUrl})`;
//         el.style.width = '45px';
//         el.style.height = '45px';
//         el.style.backgroundSize = 'cover';
//         el.style.borderRadius = '30%';
//         el.style.display = 'inline-block';
//         el.style.overflow = 'hidden';

//         const popupContent = `
//           <div class="p-4 max-w-xs">
//             <button
//               id="remove-point-${index}"
//               class="absolute left-0 top-0 px-2 py-1 bg-slate-200 text-black shadow-md focus:outline-none z-40 hover:bg-cyan-800 hover:text-white transition-transform duration-300 transform hover:scale-95"
//             >
//               Remove Point
//             </button>
//             <strong class="text-lg">${index + 1}. ${
//               place.displayName.text
//             }</strong><br>
//             <strong>Rating:</strong> ${place.rating} ⭐<br>
//             <strong>Address:</strong> ${place.formattedAddress || 'N/A'}<br>
//             <strong>Website:</strong> <a href="${place.websiteUri ? place.websiteUri : place.googleMapsUri}" class="hover:cursor-pointer hover:underline hover:text-cyan-400" target="_blank">${place.displayName.text}</a><br>
//             <strong>Open Now:</strong> ${
//               place.currentOpeningHours?.openNow ? 'Yes' : 'No'
//             }<br>
//             ${
//               place.currentOpeningHours?.weekdayDescriptions?.[
//                 new Date().getDay()
//               ] || ''
//             }<br>
//             <div class="mt-4 flex overflow-x-auto space-x-4">
//               ${place.photos
//                 ?.map((photo, photoIndex) => {
//                   const photoReference = photo.name.split('/').pop();
//                   return `
//                   <img
//                     id="image-${index}"
//                     src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=640&photo_reference=${photoReference}&key=${environment.GOOGLE_PLACES_API}"
//                     class="w-36 h-24 object-cover rounded-md shadow-sm cursor-pointer"
//                     data-photo-index="${photoIndex}"
//                     data-place-index="${index}"
//                   />`;
//                 })
//                 .join('')}
//             </div>
//           </div>
//         `;

//         const popup = new Popup({ offset: 25 }).setHTML(popupContent);

//         const marker = new Marker({ element: el })
//           .setLngLat([place.location.longitude, place.location.latitude])
//           .setPopup(popup)
//           .addTo(this.map);

//         this.markers.push(marker);

//         popup.on('open', () => {
//           const button = document.getElementById(`remove-point-${index}`);
//           if (button) {
//             if (!this.editMode) {
//               button.classList.add('hidden');
//             } else {
//               button.classList.remove('hidden');
//               button.addEventListener('click', (event) => {
//                 event.stopPropagation();
//                 this.removePoint(index);
//               });
//             }
//           }

//           const images = document.querySelectorAll(`#image-${index}`);
//           images.forEach((image) => {
//             image.addEventListener('click', (event) => {
//               const target = event.target as HTMLImageElement;
//               const imageSrc = target.src;
//               this.openImageResizeModal(imageSrc);
//             });
//           });
//         });
//       }
//     });
//   }

//   clearTrip(): void {
//     const places = this.places$.getValue();
//     if (places) {
//       this.directions.clear();
//       this.editMode = false;

//       this.markers.forEach((marker) => marker.remove());
//       this.markers = [];

//       this.places$.next([]);

//       this.directions.interactive = true;
//     }
//   }

//   saveTrip(): void {
//     const currentUser = this.user$.getValue();
//     const places = this.places$.getValue();
//     if (
//       places &&
//       currentUser &&
//       this.saveTripNameForm.controls.tripName.value
//     ) {
//       this.generatorService
//         .saveRoute(
//           currentUser._id,
//           places,
//           this.saveTripNameForm.controls.tripName.value,
//         )
//         .subscribe({
//           next: (success) => {
//             this.toggleModalSave();
//             if (success) {
//               console.log('Trip saved successfully!');
//             } else {
//               console.log('Failed to save trip.');
//             }
//           },
//           error: (err) => {
//             console.error('Error saving trip:', err);
//             alert('An error occurred while saving the trip.');
//           },
//         });
//     }
//   }

//   removePoint(index: number): void {
//     const places = this.places$.getValue();
//     if (places) {
//       const markerToRemove = this.markers[index];
//       if (markerToRemove) {
//         markerToRemove.remove();
//       }

//       places.splice(index, 1);
//     }
//   }

//   exportToGoogleMap(): void {
//     const places = this.places$.getValue();
//     if (places) {
//       if (this.editMode) {
//         alert('Edit mode is enabled');
//         return;
//       }
//       const waypoints: [number, number][] = places
//         .filter(
//           (
//             locationObj,
//           ): locationObj is Place & {
//             location: { longitude: number; latitude: number };
//           } => !!locationObj.location,
//         )
//         .map((locationObj) => [
//           locationObj.location.longitude,
//           locationObj.location.latitude,
//         ]);

//       const origin = waypoints[0];
//       const destination = waypoints[waypoints.length - 1];

//       const waypointsStr = waypoints
//         .slice(1, -1)
//         .map((wp) => `${wp[1]},${wp[0]}`)
//         .join('|');

//       const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&waypoints=${waypointsStr}`;

//       window.open(googleMapsUrl, '_blank');
//     }
//   }

//   toggleEditMode(): void {
//     this.editMode = !this.editMode;
//     this.directions.interactive = !this.directions.interactive;
//   }
// }

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
    'restaurant',
    'museum',
    'art_gallery',
    'park',
    'amusement_park',
    'night_club',
    'tourist_attraction',
  ];

  generatorParamsForm = new FormGroup({
    restaurant: new FormControl(false),
    museum: new FormControl(false),
    art_gallery: new FormControl(false),
    park: new FormControl(false),
    amusement_park: new FormControl(false),
    night_club: new FormControl(false),
    tourist_attraction: new FormControl(false),
    radius: new FormControl(1500),
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

  @ViewChild('modal')
  private modal!: ElementRef;
  @ViewChild('modalImage')
  private modalImage!: ElementRef<HTMLImageElement>;

  map!: Map;
  directions!: CustomMapLibreGlDirections;
  initialState: [number, number] = [0, 0];

  user: User | null = null;
  places: Place[] | null = null;
  markers: Marker[] = [];

  editMode: boolean = false;

  isCollapsed: boolean = false;
  showModalParams: boolean = false;
  showModalSaveTrip: boolean = false;
  isTokenModalOpen: boolean = false;

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

  toggleModalWarning() {
    this.isTokenModalOpen = !this.isTokenModalOpen;
  }

  openImageResizeModal(imageUrl: string): void {
    this.modal.nativeElement.style.display = 'block';
    this.modalImage.nativeElement.src = imageUrl;
  }

  closeImageResizeModal(): void {
    this.modal.nativeElement.style.display = 'none';
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
            if (e.data && e.data.index !== undefined) {
              if (e.data.index >= 5) {
                alert('Max 5 locations');
                this.directions.removeWaypoint(e.data.index);
              }

              if (this.editMode) {
                alert('Cannot add locations in edit mode');
                this.directions.removeWaypoint(e.data.index);
              }
            }
          });

          // this.directions.on('removewaypoint', (e) => {
          //   if (e.data && e.data.index !== undefined) {
          //     if (this.editMode) {
          //       console.log(e.data.index)
          //       this.removePoint(e.data.index)
          //     }
          //   }
          // });
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

  openModalWarning(): void {
    this.toggleModalWarning();
  }

  checkTokens(): boolean {
    if (this.user && this.user.tokens <= 0) {
      this.openModalWarning();
      return true;
    }
    return false;
  }

  generateTrip(): void {
    if (this.checkTokens()) return;

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
            <button
              id="remove-point-${index}"
              class="absolute left-0 top-0 px-2 py-1 bg-slate-200 text-black shadow-md focus:outline-none z-40 hover:bg-cyan-800 hover:text-white transition-transform duration-300 transform hover:scale-95"
            >
              Remove Point
            </button>
            <strong class="text-lg">${index + 1}. ${
              place.displayName.text
            }</strong><br>
            <strong>Rating:</strong> ${place.rating} ⭐<br>
            <strong>Address:</strong> ${place.formattedAddress || 'N/A'}<br>
            <strong>Website:</strong> <a href="${place.websiteUri ? place.websiteUri : place.googleMapsUri}" class="hover:cursor-pointer hover:underline hover:text-cyan-400" target="_blank">${place.displayName.text}</a><br>
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
                ?.map((photo, photoIndex) => {
                  const photoReference = photo.name.split('/').pop();
                  return `
                  <img
                    id="image-${index}"
                    src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=640&photo_reference=${photoReference}&key=${environment.GOOGLE_PLACES_API}"
                    class="w-36 h-24 object-cover rounded-md shadow-sm cursor-pointer"
                    data-photo-index="${photoIndex}"
                    data-place-index="${index}"
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

        popup.on('open', () => {
          const button = document.getElementById(`remove-point-${index}`);
          if (button) {
            if (!this.editMode) {
              button.classList.add('hidden');
            } else {
              button.classList.remove('hidden');
              button.addEventListener('click', (event) => {
                event.stopPropagation();
                this.removePoint(index);
              });
            }
          }

          const images = document.querySelectorAll(`#image-${index}`);
          images.forEach((image) => {
            image.addEventListener('click', (event) => {
              const target = event.target as HTMLImageElement;
              const imageSrc = target.src;
              this.openImageResizeModal(imageSrc);
            });
          });
        });
      }
    });
  }

  clearTrip(): void {
    if (this.places) {
      this.directions.clear();
      this.editMode = false;

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

  removePoint(index: number): void {
    if (this.places) {
      const markerToRemove = this.markers[index];
      if (markerToRemove) {
        markerToRemove.remove();
      }

      this.places.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  exportToGoogleMap(): void {
    if (this.places) {
      if (this.editMode) {
        alert('Edit mode is enabled');
        return;
      }
      const waypoints: [number, number][] = this.places
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

      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];

      const waypointsStr = waypoints
        .slice(1, -1)
        .map((wp) => `${wp[1]},${wp[0]}`)
        .join('|');

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&waypoints=${waypointsStr}`;

      window.open(googleMapsUrl, '_blank');
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.directions.interactive = !this.directions.interactive;
  }
}
