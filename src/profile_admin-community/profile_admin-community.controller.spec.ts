import { Test, TestingModule } from '@nestjs/testing';
import { ProfileAdminCommunityController } from './profile_admin-community.controller';
import { ProfileAdminCommunityService } from './profile_admin-community.service';

describe('ProfileAdminCommunityController', () => {
  let controller: ProfileAdminCommunityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileAdminCommunityController],
      providers: [ProfileAdminCommunityService],
    }).compile();

    controller = module.get<ProfileAdminCommunityController>(ProfileAdminCommunityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
