import { Body, Controller, Post } from '@nestjs/common';
import { GeneratorService } from './generator.service';

@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post('generate-route')
  generateRoute(@Body() { start, end }): any {
    const route = this.generatorService.generateRoute(start, end);
    return { waypoints: route };
  }
}
