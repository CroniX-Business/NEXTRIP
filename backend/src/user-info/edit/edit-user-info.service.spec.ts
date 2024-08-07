import { Test, TestingModule } from '@nestjs/testing';
import { EditUserInfoService } from './edit-user-info.service';

describe('EditUserInfoService', () => {
  let service: EditUserInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditUserInfoService],
    }).compile();

    service = module.get<EditUserInfoService>(EditUserInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
