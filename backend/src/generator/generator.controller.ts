import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
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
    },
  ): Promise<Place[]> {
    const result = this.generatorService.generateTrip(
      body.waypointsFeatures,
      body.generatorParams,
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

  @Delete('delete/:userId/:tripId')
  async deleteTrip(
    @Param('userId') userId: string,
    @Param('tripId') tripId: string,
  ): Promise<boolean> {
    return this.generatorService.removeTrip(userId, tripId);
  }
}
