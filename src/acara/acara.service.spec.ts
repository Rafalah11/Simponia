import { Test, TestingModule } from '@nestjs/testing';
import { AcaraService } from './acara.service';

describe('AcaraService', () => {
  let service: AcaraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcaraService],
    }).compile();

    service = module.get<AcaraService>(AcaraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
