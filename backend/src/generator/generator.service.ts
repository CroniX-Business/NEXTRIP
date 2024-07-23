import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GeoJsonProperties } from 'geojson';
import axios from 'axios';
import { environment } from 'environments/environment';

const GOOGLE_PLACES_API_URL =
  'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

@Injectable()
export class GeneratorService {
  private culturalPlaceTypes = [
    'art_gallery',
    'library',
    'church',
    'hindu_temple',
    'synagogue',
    'museum',
  ];

  private funPlaceTypes = [
    'amusement_park',
    'aquarium',
    'bar',
    'bowling_alley',
    'casino',
    'night_club',
    'park',
    'movie_theater',
    'tourist_attraction',
    'zoo',
  ];

  fun: boolean = false;
  async generateTrip(
    waypoints: Feature<Point, GeoJsonProperties>[],
  ): Promise<any> {
    try {
      const response = await axios.get(GOOGLE_PLACES_API_URL, {
        params: {
          location: `${waypoints[0].geometry.coordinates[1]},${waypoints[0].geometry.coordinates[0]}`,
          radius: 1000,
          type: 'bar',
          key: environment.GOOGLE_PLACES_API,
        },
      });

      if (response.data.status !== 'OK') {
        throw new HttpException(
          `Google Places API error: ${response.data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data.results.map((place: any) => ({
        name: place.name,
        address: place.vicinity,
        geometry: place.geometry.coordinates,
        rating: place.rating,
        type: place.types[0],
        icon: place.icon,
        id: place.place_id,
        url: place.url,
        website: place.website,
      }));
    } catch (error) {
      throw new HttpException(
        'Error fetching nearby places',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/*this.fun
            ? this.funPlaceTypes.join('|')
            : this.culturalPlaceTypes.join('|'), */
