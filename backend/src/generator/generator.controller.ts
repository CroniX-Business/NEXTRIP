import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';
import { Place, Trip, TripDto } from './generator.dto';

@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  async generateTrip(
    @Body()
    body: {
      waypointsFeatures: Feature<Point, GeoJsonProperties>[];
      generatorParams: TripDto;
      userId: string;
    },
  ): Promise<Place[]> {
    const result = this.generatorService.generateTrip(
      body.waypointsFeatures,
      body.generatorParams,
      body.userId,
    );
    return result;
  }

  @Post('save-route')
  async saveTrip(
    @Body() body: { userId: string; places: Place[]; tripName: string },
  ): Promise<boolean> {
    return await this.generatorService.saveTrip(
      body.userId,
      body.places,
      body.tripName,
    );
  }

  @Post('get-trips')
  async getTrips(@Body() body: { userId: string }): Promise<Trip[]> {
    return await this.generatorService.getTrips(body.userId);
  }

  @Get('get-public-trips')
  async getPublicTrips(): Promise<Trip[]> {
    return await this.generatorService.getPublicTrips();
  }

  @Delete('delete/:userId/:tripId')
  async deleteTrip(
    @Param('userId') userId: string,
    @Param('tripId') tripId: string,
  ): Promise<boolean> {
    return this.generatorService.removeTrip(userId, tripId);
  }

  @Post('save-trip-comment')
  async saveTripComment(
    @Body() body: { userId: string; tripId: string; comment: string },
  ): Promise<string> {
    return await this.generatorService.saveTripComment(
      body.userId,
      body.tripId,
      body.comment,
    );
  }

  @Post('save-public-status')
  async saveTripPublicStatus(
    @Body() body: { userId: string; tripId: string; isPublic: boolean },
  ): Promise<boolean> {
    return await this.generatorService.saveTripPublicStatus(
      body.userId,
      body.tripId,
      body.isPublic,
    );
  }
}
