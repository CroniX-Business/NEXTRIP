import { Controller, Put, Body, Param } from '@nestjs/common';
import { EditUserInfoService } from './edit-user-info.service';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

@Controller('userInfo/edit')
export class EditUserInfoController {
  constructor(private readonly editUserInfoService: EditUserInfoService) {}

  @Put(':id')
  async updateUserInfo(
    @Param('id') userId: string,
    @Body() userInfo: UpdateUserInfoDto,
  ): Promise<{ success: boolean }> {
    const success = await this.editUserInfoService.updateUserInfo(
      userId,
      userInfo,
    );
    return { success };
  }
}
