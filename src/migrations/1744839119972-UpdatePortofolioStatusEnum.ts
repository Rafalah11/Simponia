import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePortofolioStatusEnum1744839119972
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE portofolio 
          MODIFY COLUMN status 
          ENUM('Belum di Verifikasi', 'Proses Verifikasi', 'Perlu Perubahan', 'Terverifikasi', 'Dihapus') 
          NOT NULL DEFAULT 'Belum di Verifikasi'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE portofolio 
          MODIFY COLUMN status 
          VARCHAR(100) 
          NOT NULL DEFAULT 'Belum di Verifikasi'
        `);
  }
}
