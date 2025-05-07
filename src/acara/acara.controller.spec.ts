import { Test, TestingModule } from '@nestjs/testing';
import { AcaraController } from './acara.controller';
import { AcaraService } from './acara.service';

describe('AcaraController', () => {
  let controller: AcaraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcaraController],
      providers: [AcaraService],
    }).compile();

    controller = module.get<AcaraController>(AcaraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
