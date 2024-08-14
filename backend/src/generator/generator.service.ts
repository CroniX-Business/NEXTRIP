// import { Feature, Point } from '@maplibre/maplibre-gl-directions';
// import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
// import { GeoJsonProperties } from 'geojson';
// import axios from 'axios';
// import { environment } from 'environments/environment';
// import { TripDto, Place } from './generator.dto';

// const GOOGLE_PLACES_SEARCH_NEARBY_URL =
//   'https://places.googleapis.com/v1/places:searchNearby';

// @Injectable()
// export class GeneratorService {
//   defaultRadius: number = 1000;

//   async generateTrip(
//     waypoints: Feature<Point, GeoJsonProperties>[],
//     generatorParams: TripDto,
//   ): Promise<any> {
//     try {
//       const trueKeys = this.getTrueKeys(generatorParams);

//       const responses = await Promise.all(
//         waypoints.map(async (waypoint) => {
//           const [longitude, latitude] = this.getCoordinates(waypoint);
//           const radius = generatorParams.radius || this.defaultRadius;

//           return radius < 1500
//             ? await this.makeSingleApiCall(
//                 latitude,
//                 longitude,
//                 radius,
//                 trueKeys,
//               )
//             : await this.makeMultipleApiCalls(
//                 latitude,
//                 longitude,
//                 radius,
//                 trueKeys,
//               );
//         }),
//       );

//       const filteredPlaces = this.filterAndMapPlaces(responses.flat());

//       const combinedPlaces = this.combinePlaces(
//         filteredPlaces,
//         waypoints.length,
//       );

//       return combinedPlaces;
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   private getTrueKeys(generatorParams: TripDto): string[] {
//     return Object.keys(generatorParams.typeOfTrip).filter(
//       (key) => generatorParams.typeOfTrip[key],
//     );
//   }

//   private getCoordinates(
//     waypoint: Feature<Point, GeoJsonProperties>,
//   ): [number, number] {
//     const { coordinates } = waypoint.geometry;
//     return [coordinates[0], coordinates[1]];
//   }

//   private async makeSingleApiCall(
//     latitude: number,
//     longitude: number,
//     radius: number,
//     trueKeys: string[],
//   ): Promise<Place[]> {
//     const requestBody = {
//       includedTypes: trueKeys,
//       maxResultCount: 20,
//       locationRestriction: {
//         circle: {
//           center: { latitude, longitude },
//           radius,
//         },
//       },
//       rankPreference: 'POPULARITY',
//     };

//     const response = await axios.post(
//       GOOGLE_PLACES_SEARCH_NEARBY_URL,
//       requestBody,
//       {
//         headers: this.getRequestHeaders(),
//       },
//     );

//     return response.data.places || [];
//   }

//   private async makeMultipleApiCalls(
//     latitude: number,
//     longitude: number,
//     radius: number,
//     trueKeys: string[],
//   ): Promise<Place[]> {
//     const requests = trueKeys.map((type) => {
//       const requestBody = {
//         includedTypes: [type],
//         maxResultCount: 10,
//         locationRestriction: {
//           circle: {
//             center: { latitude, longitude },
//             radius,
//           },
//         },
//         rankPreference: 'POPULARITY',
//       };

//       return axios.post(GOOGLE_PLACES_SEARCH_NEARBY_URL, requestBody, {
//         headers: this.getRequestHeaders(),
//       });
//     });

//     const responses = await Promise.all(requests);

//     return responses.flatMap((response) => response.data.places || []);
//   }

//   private getRequestHeaders(): Record<string, string> {
//     return {
//       'Content-Type': 'application/json',
//       'X-Goog-Api-Key': environment.GOOGLE_PLACES_API,
//       'X-Goog-FieldMask':
//         'places.displayName,places.rating,places.primaryType,places.location',
//     };
//   }

//   private filterAndMapPlaces(places: Place[]): Place[] {
//     return places
//       .filter((place) => place.rating && place.rating > 4.6)
//       .map((place) => ({
//         ...place,
//         displayName: place.displayName,
//         primaryType: place.primaryType,
//       }));
//   }

//   private combinePlaces(places: Place[], waypointCount: number): Place[] {
//     if (waypointCount === 1) {
//       return places;
//     }

//     if (waypointCount === 2) {
//       const splitIndex = Math.floor(places.length * 0.4);
//       return [...places.slice(0, splitIndex), ...places.slice(splitIndex)];
//     }

//     if (waypointCount > 2) {
//       const splitIndex = Math.floor(places.length * 0.2);
//       return [...places.slice(0, splitIndex), ...places.slice(splitIndex)];
//     }

//     return places;
//   }

//   private handleError(error: any): void {
//     Logger.error(
//       'Error fetching nearby places',
//       error.message,
//       'GeneratorService',
//     );
//     if (error.response) {
//       Logger.error(
//         `API Response Error: ${error.response.data}`,
//         null,
//         'GeneratorService',
//       );
//     }
//     throw new HttpException(
//       'Error fetching nearby places',
//       HttpStatus.INTERNAL_SERVER_ERROR,
//     );
//   }
// }

import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GeoJsonProperties } from 'geojson';
import axios from 'axios';
import { environment } from 'environments/environment';
import { TripDto, Place } from './generator.dto';

const GOOGLE_PLACES_SEARCH_NEARBY_URL =
  'https://places.googleapis.com/v1/places:searchNearby';

@Injectable()
export class GeneratorService {
  defaultRadius: number = 1000;

  async generateTrip(
    waypoints: Feature<Point, GeoJsonProperties>[],
    generatorParams: TripDto,
  ): Promise<Place[]> {
    try {
      const trueKeys = this.getTrueKeys(generatorParams);

      const responses = await Promise.all(
        waypoints.map(async (waypoint) => {
          const [longitude, latitude] = this.getCoordinates(waypoint);
          const radius = generatorParams.radius || this.defaultRadius;

          return radius < 1500
            ? await this.makeSingleApiCall(
                latitude,
                longitude,
                radius,
                trueKeys,
              )
            : await this.makeMultipleApiCalls(
                latitude,
                longitude,
                radius,
                trueKeys,
              );
        }),
      );

      const filteredPlaces = this.filterAndMapPlaces(responses.flat());

      const combinedPlaces = this.combinePlaces(
        filteredPlaces,
        waypoints.length,
      );

      const lastWaypoint = waypoints[waypoints.length - 1];
      const sortedPlaces = this.sortPlacesByDistanceFromWaypoint(
        combinedPlaces,
        lastWaypoint,
      );

      return sortedPlaces;
    } catch (error) {
      //this.handleError(error);
      Logger.error(
        'Error fetching nearby places',
        error.message,
        'GeneratorService',
      );
      if (error.response) {
        Logger.error(
          `API Response Error: ${error.response.data}`,
          null,
          'GeneratorService',
        );
      }
      throw new HttpException(
        'Error fetching nearby places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getTrueKeys(generatorParams: TripDto): string[] {
    return Object.keys(generatorParams.typeOfTrip).filter(
      (key) => generatorParams.typeOfTrip[key],
    );
  }

  private getCoordinates(
    waypoint: Feature<Point, GeoJsonProperties>,
  ): [number, number] {
    const { coordinates } = waypoint.geometry;
    return [coordinates[0], coordinates[1]];
  }

  private async makeSingleApiCall(
    latitude: number,
    longitude: number,
    radius: number,
    trueKeys: string[],
  ): Promise<Place[]> {
    const requestBody = {
      includedTypes: trueKeys,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
      rankPreference: 'POPULARITY',
    };

    const response = await axios.post(
      GOOGLE_PLACES_SEARCH_NEARBY_URL,
      requestBody,
      {
        headers: this.getRequestHeaders(),
      },
    );

    return response.data.places || [];
  }

  private async makeMultipleApiCalls(
    latitude: number,
    longitude: number,
    radius: number,
    trueKeys: string[],
  ): Promise<Place[]> {
    const requests = trueKeys.map((type) => {
      const requestBody = {
        includedTypes: [type],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius,
          },
        },
        rankPreference: 'POPULARITY',
      };

      return axios.post(GOOGLE_PLACES_SEARCH_NEARBY_URL, requestBody, {
        headers: this.getRequestHeaders(),
      });
    });

    const responses = await Promise.all(requests);

    return responses.flatMap((response) => response.data.places || []);
  }

  private getRequestHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.GOOGLE_PLACES_API,
      'X-Goog-FieldMask':
        'places.displayName,places.rating,places.primaryType,places.location',
    };
  }

  private filterAndMapPlaces(places: Place[]): Place[] {
    return places
      .filter((place) => place.rating && place.rating > 4.6)
      .map((place) => ({
        ...place,
        displayName: place.displayName,
        primaryType: place.primaryType,
      }));
  }

  private combinePlaces(places: Place[], waypointCount: number): Place[] {
    if (waypointCount === 1) {
      return places;
    }

    if (waypointCount === 2) {
      const splitIndex = Math.floor(places.length * 0.4);
      return [...places.slice(0, splitIndex), ...places.slice(splitIndex)];
    }

    if (waypointCount > 2) {
      const splitIndex = Math.floor(places.length * 0.2);
      return [...places.slice(0, splitIndex), ...places.slice(splitIndex)];
    }

    return places;
  }

  private sortPlacesByDistanceFromWaypoint(
    places: Place[],
    waypoint: Feature<Point, GeoJsonProperties>,
  ): Place[] {
    const [waypointLng, waypointLat] = this.getCoordinates(waypoint);

    return places.sort((a, b) => {
      const distanceA = this.calculateDistance(
        waypointLat,
        waypointLng,
        a.location.latitude,
        a.location.longitude,
      );
      const distanceB = this.calculateDistance(
        waypointLat,
        waypointLng,
        b.location.latitude,
        b.location.longitude,
      );
      return distanceB - distanceA; // Sort in descending order of distance
    });
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // private handleError(error: any): void {
  //   Logger.error(
  //     'Error fetching nearby places',
  //     error.message,
  //     'GeneratorService',
  //   );
  //   if (error.response) {
  //     Logger.error(
  //       `API Response Error: ${error.response.data}`,
  //       null,
  //       'GeneratorService',
  //     );
  //   }
  //   throw new HttpException(
  //     'Error fetching nearby places',
  //     HttpStatus.INTERNAL_SERVER_ERROR,
  //   );
  // }
}
