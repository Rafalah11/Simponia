import { Test, TestingModule } from '@nestjs/testing';
import { AnggotaAcaraService } from './anggota-acara.service';

describe('AnggotaAcaraService', () => {
  let service: AnggotaAcaraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnggotaAcaraService],
    }).compile();

    service = module.get<AnggotaAcaraService>(AnggotaAcaraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
