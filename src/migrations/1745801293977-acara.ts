import { MigrationInterface, QueryRunner } from 'typeorm';

export class Acara1745801293977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE acara (
                    id VARCHAR(36) NOT NULL DEFAULT (UUID()),  -- PK UniqueID
                    id_user VARCHAR(36) NOT NULL,              -- FK id_user
                    judul VARCHAR(255) NOT NULL,
                    ketua_pelaksana VARCHAR(36) NOT NULL,     -- FK ke users (id_users)
                    tanggal DATETIME NOT NULL,
                    jumlah_panitia INT NOT NULL,
                    status ENUM('active', 'ongoing', 'finished') NOT NULL DEFAULT 'ongoing',
                    gambar VARCHAR(255) NULL,
                    deskripsi TEXT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    CONSTRAINT FK_acara_user FOREIGN KEY (id_user) 
                        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    CONSTRAINT FK_acara_ketua_pelaksana FOREIGN KEY (ketua_pelaksana) 
                        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
                ) ENGINE=InnoDB;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE acara`);
  }
}
