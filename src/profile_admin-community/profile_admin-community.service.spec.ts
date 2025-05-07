import { Test, TestingModule } from '@nestjs/testing';
import { ProfileAdminCommunityService } from './profile_admin-community.service';

describe('ProfileAdminCommunityService', () => {
  let service: ProfileAdminCommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileAdminCommunityService],
    }).compile();

    service = module.get<ProfileAdminCommunityService>(ProfileAdminCommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
