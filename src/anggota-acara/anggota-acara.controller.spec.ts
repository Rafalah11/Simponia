import { Test, TestingModule } from '@nestjs/testing';
import { AnggotaAcaraController } from './anggota-acara.controller';
import { AnggotaAcaraService } from './anggota-acara.service';

describe('AnggotaAcaraController', () => {
  let controller: AnggotaAcaraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnggotaAcaraController],
      providers: [AnggotaAcaraService],
    }).compile();

    controller = module.get<AnggotaAcaraController>(AnggotaAcaraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
