import { MigrationInterface, QueryRunner } from 'typeorm';

export class AnggotaAcara1748698144005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE anggota_acara (
        id VARCHAR(36) NOT NULL DEFAULT (UUID()),
        id_acara VARCHAR(36) NOT NULL,
        id_user VARCHAR(36) NULL,
        nama VARCHAR(255) NULL,
        nim VARCHAR(50) NULL,
        jabatan VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status ENUM('ABSENT', 'PERMISSION', 'PRESENT') DEFAULT 'ABSENT',
        
        kerjasama INT NULL,               -- Nilai Kerjasama (0-100)
        kedisiplinan INT NULL,            -- Nilai Kedisiplinan (0-100)
        komunikasi INT NULL,              -- Nilai Komunikasi (0-100)
        tanggung_jawab INT NULL,          -- Nilai Tanggung Jawab (0-100)
        nilai_rata_rata FLOAT NULL,       -- Nilai rata-rata dari 4 aspek
        grade VARCHAR(20) NULL,             -- Grade (A, B+, B, dll.)
        catatan TEXT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_anggota_acara_acara FOREIGN KEY (id_acara) 
          REFERENCES acara(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_anggota_acara_user FOREIGN KEY (id_user) 
          REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
    // status ENUM('Tidak Hadir', 'Izin', 'Hadir') DEFAULT 'Tidak Hadir',
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE anggota_acara`);
  }
}
