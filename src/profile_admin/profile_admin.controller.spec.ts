import { Test, TestingModule } from '@nestjs/testing';
import { ProfileAdminController } from './profile_admin.controller';
import { ProfileAdminService } from './profile_admin.service';

describe('ProfileAdminController', () => {
  let controller: ProfileAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileAdminController],
      providers: [ProfileAdminService],
    }).compile();

    controller = module.get<ProfileAdminController>(ProfileAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
