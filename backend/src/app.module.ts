import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { environment } from 'environments/environment';

@Module({
  imports: [MongooseModule.forRoot(environment.MongoURI), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
