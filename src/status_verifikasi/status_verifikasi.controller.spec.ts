import { Test, TestingModule } from '@nestjs/testing';
import { StatusVerifikasiController } from './status_verifikasi.controller';
import { StatusVerifikasiService } from './status_verifikasi.service';

describe('StatusVerifikasiController', () => {
  let controller: StatusVerifikasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusVerifikasiController],
      providers: [StatusVerifikasiService],
    }).compile();

    controller = module.get<StatusVerifikasiController>(StatusVerifikasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
