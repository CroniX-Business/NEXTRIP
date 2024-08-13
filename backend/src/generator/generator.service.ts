// import { Feature, Point } from '@maplibre/maplibre-gl-directions';
// import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import { environment } from 'environments/environment';
// import { TripDto } from './generator.dto';
// import { GeoJsonProperties } from 'geojson';

// const GOOGLE_PLACES_SEARCH_NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';

// @Injectable()
// export class GeneratorService {
//   fun: string;

//   async generateTrip(
//     waypoints: Feature<Point, GeoJsonProperties>[],
//     params: TripDto,
//   ): Promise<any> {
//     try {
//       const trueKeys = Object.keys(params).filter((key) => params[key]);

//       this.fun = trueKeys.join(', ');
//       Logger.debug(`Selected types: ${this.fun}`);

//       const { coordinates } = waypoints[0].geometry;
//       const [longitude, latitude] = coordinates;

//       // Separate the included types into individual API requests
//       const requests = trueKeys.map(type => ({
//         type,
//         request: axios.post(GOOGLE_PLACES_SEARCH_NEARBY_URL, {
//           includedTypes: [type],
//           maxResultCount: 10,
//           locationRestriction: {
//             circle: {
//               center: {
//                 latitude,
//                 longitude,
//               },
//               radius: 1000.0,
//             },
//           },
//         }, {
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Goog-Api-Key': environment.GOOGLE_PLACES_API,
//             'X-Goog-FieldMask': 'places.displayName,places.rating,places.location,places.primaryType',
//           },
//         }),
//       }));

//       // Make all API calls
//       const responses = await Promise.all(requests.map(req => req.request));

//       Logger.log(responses[0].data)

//       // Combine results from all responses
//       const combinedResults = responses.flatMap((response) => {
//         const places = response.data.places.map((place: any) => ({
//           name: place.displayName.text,
//           latitude: place.location?.latitude,
//           longitude: place.location?.longitude,
//           type: place.primaryType,
//           rating: place.rating
//         }));
//         return places;
//       });

//       // Distribute results
//       const resultsByType = trueKeys.reduce((acc, type) => {
//         acc[type] = combinedResults.filter(place => place.type === type);
//         return acc;
//       }, {} as Record<string, any[]>);

//       // Calculate distribution
//       const resultsArray = Object.values(resultsByType).flat();
//       const resultCount = Math.min(10, resultsArray.length); // Adjust the final count as needed
//       const splitCount = Math.floor(resultCount / trueKeys.length);

//       const finalResults = trueKeys.reduce((acc, type) => {
//         acc.push(...resultsByType[type].slice(0, splitCount));
//         return acc;
//       }, [] as any[]);

//       return finalResults;

//     } catch (error) {
//       // Log only relevant parts of the error
//       Logger.error('Error fetching nearby places', error.message, 'GeneratorService');
//       if (error.response) {
//         Logger.error(`API Response Error: ${error.response.data}`, null, 'GeneratorService');
//       }
//       throw new HttpException(
//         'Error fetching nearby places',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
// }

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
//   async generateTrip(
//     waypoints: Feature<Point, GeoJsonProperties>[],
//     generatorParams: TripDto,
//   ): Promise<any> {
//     try {
//       const trueKeys = Object.keys(generatorParams.typeOfTrip).filter(
//         (key) => generatorParams.typeOfTrip[key]
//       );

//       Logger.log(trueKeys.length)
//       const { coordinates } = waypoints[0].geometry;
//       const [longitude, latitude] = coordinates;

//       const requestBody = {
//         includedTypes: trueKeys,
//         maxResultCount: 20,
//         locationRestriction: {
//           circle: {
//             center: {
//               latitude: latitude,
//               longitude: longitude,
//             },
//             radius: 1000.0,
//           },
//         },
//         rankPreference: 'POPULARITY',
//       };

//       const response = await axios.post(
//         GOOGLE_PLACES_SEARCH_NEARBY_URL,
//         requestBody,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Goog-Api-Key': environment.GOOGLE_PLACES_API,
//             'X-Goog-FieldMask':
//               'places.displayName,places.rating,places.primaryType,places.location',
//           },
//         },
//       );

//       if (response.data.error) {
//         throw new HttpException(
//           `Google Places API error: ${response.data.error.message}`,
//           HttpStatus.BAD_REQUEST,
//         );
//       }

//       return response.data.places.map((place: Place) => ({
//         name: place.displayName.text,
//         latitude: place.location?.lat,
//         longitude: place.location?.lng,
//         type: place.primaryType,
//         rating: place.rating,
//       }));

//     } catch (error) {
//       Logger.error(
//         'Error fetching nearby places',
//         error.message,
//         'GeneratorService',
//       );
//       if (error.response) {
//         Logger.error(
//           `API Response Error: ${error.response.data}`,
//           null,
//           'GeneratorService',
//         );
//       }
//       throw new HttpException(
//         'Error fetching nearby places',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
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
  ): Promise<any> {
    try {
      const trueKeys = this.getTrueKeys(generatorParams);
      const [longitude, latitude] = this.getCoordinates(waypoints);

      const radius = generatorParams.radius || this.defaultRadius;
      const responses =
        radius < 1500
          ? await this.makeSingleApiCall(latitude, longitude, radius, trueKeys)
          : await this.makeMultipleApiCalls(
              latitude,
              longitude,
              radius,
              trueKeys,
            );

      const places = this.mapPlaces(responses);

      return places;
    } catch (error) {
      this.handleError(error);
    }
  }

  private getTrueKeys(generatorParams: TripDto): string[] {
    return Object.keys(generatorParams.typeOfTrip).filter(
      (key) => generatorParams.typeOfTrip[key],
    );
  }

  private getCoordinates(
    waypoints: Feature<Point, GeoJsonProperties>[],
  ): [number, number] {
    const { coordinates } = waypoints[0].geometry;
    return [coordinates[0], coordinates[1]];
  }

  private async makeSingleApiCall(
    latitude: number,
    longitude: number,
    radius: number,
    trueKeys: string[],
  ): Promise<any[]> {
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

    return [response];
  }

  private async makeMultipleApiCalls(
    latitude: number,
    longitude: number,
    radius: number,
    trueKeys: string[],
  ): Promise<any[]> {
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

    return Promise.all(requests);
  }

  private getRequestHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.GOOGLE_PLACES_API,
      'X-Goog-FieldMask':
        'places.displayName,places.rating,places.primaryType,places.location',
    };
  }

  private mapPlaces(responses: any[]): any[] {
    return responses.flatMap((response) => {
      return response.data.places.map((place: Place) => ({
        name: place.displayName.text,
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        type: place.primaryType,
        rating: place.rating,
      }));
    });
  }

  private handleError(error: any): void {
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
