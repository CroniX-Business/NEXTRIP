import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { environment } from 'environments/environment';
import { GeneratorController } from './generator/generator.controller';
import { GeneratorService } from './generator/generator.service';
import { ContactModule } from './contact/contact.module';
import { EditModule } from 'user-info/edit/edit.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.MONGO_URI),
    AuthModule,
    ContactModule,
    EditModule
  ],
  controllers: [AppController, GeneratorController],
  providers: [AppService, GeneratorService],
})
export class AppModule {}
