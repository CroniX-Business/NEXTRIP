import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { environment } from 'environments/environment';
import { GeneratorController } from './generator/generator.controller';
import { GeneratorService } from './generator/generator.service';

@Module({
  imports: [MongooseModule.forRoot(environment.MONGO_URI), AuthModule],
  controllers: [AppController, GeneratorController],
  providers: [AppService, GeneratorService],
})
export class AppModule {}
