import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GeoJsonProperties } from 'geojson';
import axios from 'axios';
import { environment } from 'environments/environment';
import { TripDto, Place, Trip } from './generator.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ITrip, User } from 'schemas/user.schema';
import { Model, Types } from 'mongoose';

const GOOGLE_PLACES_SEARCH_NEARBY_URL =
  'https://places.googleapis.com/v1/places:searchNearby';

@Injectable()
export class GeneratorService {
  defaultRadius: number = 1000;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ITrip.name) private tripModel: Model<ITrip>,
  ) {}

  async updateTripLikes(
    userId: string,
    tripId: string,
    change: number,
  ): Promise<boolean> {
    try {
      if (![1, -1].includes(change)) {
        throw new BadRequestException(
          'Invalid change value. It must be 1 or -1.',
        );
      }

      const userObjectId = new Types.ObjectId(userId);
      const tripObjectId = new Types.ObjectId(tripId);

      const user = await this.userModel.findOne({
        'trips.tripId': tripObjectId,
      }).exec();
      if (!user) {
        throw new NotFoundException(`User with trip ID ${tripId} not found`);
      }

      const tripToUpdate = user.trips.find(trip => trip.tripId.equals(tripObjectId));
      if (!tripToUpdate) {
        throw new NotFoundException(`Trip with ID ${tripId} not found in user's trips`);
      }

      const newLikesCount = tripToUpdate.likes + change;
      const userHasLiked = tripToUpdate.likedBy.includes(userObjectId);

      if (change === 1 && !userHasLiked) {
        tripToUpdate.likes = newLikesCount;
        tripToUpdate.likedBy.push(userObjectId);
      } else if (change === -1 && userHasLiked) {
        tripToUpdate.likes = newLikesCount;
        tripToUpdate.likedBy = tripToUpdate.likedBy.filter(id => !id.equals(userObjectId));
      } else {
        return false;
      }

      await user.save();
      
      return true
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error updating trip likes');
      }
    }
  }

  async saveTripPublicStatus(
    userId: string,
    tripId: string,
    isPublic: boolean,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const trip = user.trips.find((t) => t.tripId.toString() === tripId);
      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      trip.public = isPublic;
      await user.save();

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error saving comment');
      }
    }
  }

  async saveTripComment(
    userId: string,
    tripId: string,
    comment: string,
  ): Promise<string> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const trip = user.trips.find((t) => t.tripId.toString() === tripId);
      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      trip.comment = comment;
      await user.save();

      return 'Comment saved successfully';
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error saving comment');
      }
    }
  }

  async removeTrip(userId: string, tripId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tripIndex = user.trips.findIndex(
      (trip) => trip.tripId.toString() === tripId,
    );

    if (tripIndex === -1) {
      throw new NotFoundException('Trip not found');
    }

    user.trips.splice(tripIndex, 1);
    await user.save();

    return true;
  }

  async getTrips(userId: string): Promise<Trip[]> {
    const user = await this.userModel.findById(userId).select('trips').exec();
    if (!user) {
      throw new Error('User not found');
    }

    return user.trips;
  }

  async getPublicTrips(): Promise<Trip[]> {
    const users = await this.userModel.find().exec();
    const publicTrips: Trip[] = [];

    users.forEach((user) => {
      const publicUserTrips = user.trips.filter((trip) => trip.public);
      publicTrips.push(...publicUserTrips);
    });

    return publicTrips;
  }

  async saveTrip(
    userId: string,
    places: Place[],
    tripName: string,
  ): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newTrip = {
        tripId: new Types.ObjectId() as Types.ObjectId,
        tripName,
        places,
        timeSaved: new Date(),
        comment: '',
        public: false,
        likes: 0,
        likedBy: [],
      };

      user.trips.push(newTrip);
      await user.save();
      return true;
    } catch (error) {
      console.error('Error saving trip:', error);
      return false;
    }
  }

  async generateTrip(
    waypoints: Feature<Point, GeoJsonProperties>[],
    generatorParams: TripDto,
    userId: string,
  ): Promise<Place[]> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.tokens <= 0) {
        throw new Error('Insufficient tokens');
      }

      const trueKeys = this.getTrueKeys(generatorParams);

      const responses = await Promise.all(
        waypoints.map(async (waypoint) => {
          const [longitude, latitude] = this.getCoordinates(waypoint);
          const radius = generatorParams.radius;

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

      const filteredPlaces = this.filterAndMapPlaces(
        generatorParams,
        responses.flat(),
      );

      const combinedPlaces = this.combinePlaces(
        filteredPlaces,
        waypoints.length,
      );

      const lastWaypoint = waypoints[waypoints.length - 1];
      const sortedPlaces = this.sortPlacesByDistanceFromWaypoint(
        combinedPlaces,
        lastWaypoint,
      );

      user.tokens -= 1;
      await user.save();

      return sortedPlaces;
    } catch (error) {
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
        'places.displayName,places.formattedAddress,places.rating,places.primaryType,places.location,places.photos,places.currentOpeningHours,places.priceLevel,places.googleMapsUri,places.websiteUri',
    };
  }

  private filterAndMapPlaces(
    generatorParams: TripDto,
    places: Place[],
  ): Place[] {
    return places
      .filter((place) => place.rating && place.rating > generatorParams.rating)
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
      return distanceB - distanceA;
    });
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
