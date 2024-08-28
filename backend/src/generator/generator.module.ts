import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ITrip, TripSchema, User, UserSchema } from 'schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: ITrip.name, schema: TripSchema }]),
  ],
  controllers: [GeneratorController],
  providers: [GeneratorService],
})
export class GeneratorModule {}
