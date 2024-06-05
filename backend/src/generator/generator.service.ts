import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneratorService {
  generateRoute(
    start: { latitude: string; longitude: string },
    end: { latitude: string; longitude: string },
  ): [number, number][] {
    return [
      [parseFloat(start.longitude), parseFloat(start.latitude)],
      [parseFloat(end.longitude), parseFloat(end.latitude)],
    ];
  }
}
