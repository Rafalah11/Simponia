import { Test, TestingModule } from '@nestjs/testing';
import { StatusVerifikasiService } from './status_verifikasi.service';

describe('StatusVerifikasiService', () => {
  let service: StatusVerifikasiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusVerifikasiService],
    }).compile();

    service = module.get<StatusVerifikasiService>(StatusVerifikasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
