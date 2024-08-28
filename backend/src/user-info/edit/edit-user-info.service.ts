import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'schemas/user.schema';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

@Injectable()
export class EditUserInfoService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async updateUserInfo(
    userId: string,
    updateUserInfoDto: UpdateUserInfoDto,
  ): Promise<boolean> {
    try {
      const filteredUpdateDto = this.filterEmptyFields(updateUserInfoDto);
      Logger.debug(filteredUpdateDto);

      const updateResult = await this.userModel.updateOne(
        { _id: userId },
        { $set: filteredUpdateDto },
        { runValidators: true },
      );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundException('User not found');
      }

      return updateResult.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating user info:', error);
      return false;
    }
  }

  private filterEmptyFields(
    updateUserInfoDto: UpdateUserInfoDto,
  ): Partial<UpdateUserInfoDto> {
    const filteredDto: Partial<UpdateUserInfoDto> = {};

    for (const key in updateUserInfoDto) {
      if (updateUserInfoDto[key] !== null && updateUserInfoDto[key] !== '') {
        filteredDto[key] = updateUserInfoDto[key];
      }
    }

    return filteredDto;
  }
}
