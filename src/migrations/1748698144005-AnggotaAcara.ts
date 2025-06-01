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
        status ENUM('ABSENT', 'PERMISSION', 'PRESENT') DEFAULT 'PRESENT',
        kerja_sama FLOAT NULL,
        komunikasi FLOAT NULL,
        disiplin FLOAT NULL,
        tanggung_jawab FLOAT NULL,
        penilaian VARCHAR(255) NULL
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_anggota_acara_acara FOREIGN KEY (id_acara) 
          REFERENCES acara(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_anggota_acara_user FOREIGN KEY (id_user) 
          REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE anggota_acara`);
  }
}
