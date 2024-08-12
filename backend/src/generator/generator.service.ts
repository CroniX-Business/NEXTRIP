import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { environment } from 'environments/environment';
import { TripDto } from './generator.dto';
import { GeoJsonProperties } from 'geojson';

const GOOGLE_PLACES_SEARCH_NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';

@Injectable()
export class GeneratorService {
  fun: string;

  async generateTrip(
    waypoints: Feature<Point, GeoJsonProperties>[],
    params: TripDto,
  ): Promise<any> {
    try {
      const trueKeys = Object.keys(params).filter((key) => params[key]);

      this.fun = trueKeys.join(', ');
      Logger.debug(`Selected types: ${this.fun}`);

      const { coordinates } = waypoints[0].geometry;
      const [longitude, latitude] = coordinates;

      // Separate the included types into individual API requests
      const requests = trueKeys.map(type => ({
        type,
        request: axios.post(GOOGLE_PLACES_SEARCH_NEARBY_URL, {
          includedTypes: [type],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius: 1000.0,
            },
          },
        }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': environment.GOOGLE_PLACES_API,
            'X-Goog-FieldMask': 'places.displayName,places.rating,places.location,places.primaryType',
          },
        }),
      }));

      // Make all API calls
      const responses = await Promise.all(requests.map(req => req.request));

      Logger.log(responses[0].data)

      // Combine results from all responses
      const combinedResults = responses.flatMap((response) => {
        const places = response.data.places.map((place: any) => ({
          name: place.displayName.text,
          latitude: place.location?.latitude,
          longitude: place.location?.longitude,
          type: place.primaryType,
          rating: place.rating
        }));
        return places;
      });

      // Distribute results
      const resultsByType = trueKeys.reduce((acc, type) => {
        acc[type] = combinedResults.filter(place => place.type === type);
        return acc;
      }, {} as Record<string, any[]>);

      // Calculate distribution
      const resultsArray = Object.values(resultsByType).flat();
      const resultCount = Math.min(10, resultsArray.length); // Adjust the final count as needed
      const splitCount = Math.floor(resultCount / trueKeys.length);

      const finalResults = trueKeys.reduce((acc, type) => {
        acc.push(...resultsByType[type].slice(0, splitCount));
        return acc;
      }, [] as any[]);

      return finalResults;

    } catch (error) {
      // Log only relevant parts of the error
      Logger.error('Error fetching nearby places', error.message, 'GeneratorService');
      if (error.response) {
        Logger.error(`API Response Error: ${error.response.data}`, null, 'GeneratorService');
      }
      throw new HttpException(
        'Error fetching nearby places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
