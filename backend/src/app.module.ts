import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { environment } from 'environments/environment';
import { ContactModule } from './contact/contact.module';
import { EditModule } from 'user-info/edit/edit.module';
import { GeneratorModule } from './generator/generator.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.MONGO_URI),
    AuthModule,
    ContactModule,
    EditModule,
    GeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
