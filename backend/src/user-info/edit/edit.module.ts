import { Module } from '@nestjs/common';
import { EditUserInfoService } from './edit-user-info.service';
import { EditUserInfoController } from './edit-user-info.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [EditUserInfoController],
  providers: [EditUserInfoService],
})
export class EditModule {}
