import { Test, TestingModule } from '@nestjs/testing';
import { EditUserInfoController } from './edit-user-info.controller';

describe('EditUserInfoController', () => {
  let controller: EditUserInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditUserInfoController],
    }).compile();

    controller = module.get<EditUserInfoController>(EditUserInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
