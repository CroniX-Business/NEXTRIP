import { Body, Controller, Post } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';
import { TripDto } from './generator.dto'

@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  async generateTrip(
    @Body() body: { waypointsFeatures: Feature<Point, GeoJsonProperties>[], params: TripDto },

  ): Promise<any> {
    const result = this.generatorService.generateTrip(body.waypointsFeatures, body.params);
    return result;
  }
}

/* 
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
  fun: string;

    //const type = params.typeOfTrip === 'exploring' ? this.culturalPlaceTypes : this.funPlaceTypes;

    const trueKeys = Object.keys(params).filter(key => params[key]);

    this.fun = trueKeys.join('|');
    Logger.debug(this.fun)
*/