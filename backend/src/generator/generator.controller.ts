import { Body, Controller, Post } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';

@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  async generateTrip(
    @Body() body: { waypointsFeatures: Feature<Point, GeoJsonProperties>[] },
  ): Promise<any> {
    const waypointsFeatures = body.waypointsFeatures;

    const result = this.generatorService.generateTrip(waypointsFeatures);
    return result;
  }
}
