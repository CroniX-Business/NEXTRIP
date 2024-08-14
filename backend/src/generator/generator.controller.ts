import { Body, Controller, Post } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';
import { Place, TripDto } from './generator.dto';

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
}
