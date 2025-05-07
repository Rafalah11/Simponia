import { Test, TestingModule } from '@nestjs/testing';
import { ProfileUserController } from './profile_user.controller';
import { ProfileUserService } from './profile_user.service';

describe('ProfileUserController', () => {
  let controller: ProfileUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileUserController],
      providers: [ProfileUserService],
    }).compile();

    controller = module.get<ProfileUserController>(ProfileUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
