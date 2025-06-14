import { MigrationInterface, QueryRunner } from 'typeorm';

export class Acara1745801293977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE acara (
                    id VARCHAR(36) NOT NULL DEFAULT (UUID()),  -- PK UniqueID
                    id_user VARCHAR(36) NOT NULL,              -- FK id_user
                    judul VARCHAR(255) NOT NULL,
                    tanggal DATETIME NOT NULL,
                    jumlah_panitia INT NOT NULL,
                    skor INT NOT NULL,
                    status ENUM('Active', 'Ongoing', 'Finished') NOT NULL DEFAULT 'ongoing',
                    gambar VARCHAR(255) NULL,
                    deskripsi TEXT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    CONSTRAINT FK_acara_user FOREIGN KEY (id_user) 
                        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
                ) ENGINE=InnoDB;
            `);
    // status ENUM('Aktif', 'Sedang Berjalan', 'Selesai') NOT NULL DEFAULT 'Sedang Berjalan',
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE acara`);
  }
}
