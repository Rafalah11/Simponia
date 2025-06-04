import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortofolio1744829178026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabel Portofolio utama
    await queryRunner.query(`
          CREATE TABLE portofolio (
            id VARCHAR(36) NOT NULL DEFAULT (UUID()),
            nama_projek VARCHAR(255) NOT NULL,
            kategori VARCHAR(255) NOT NULL,
            tahun INT NOT NULL,
            status ENUM('Belum di Verifikasi', 'Proses Verifikasi', 'Perlu Perubahan', 'Terverifikasi', 'Dihapus'),
            gambar VARCHAR(255) NULL,
            deskripsi TEXT NULL,
            creator VARCHAR(255),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB;
        `);

    // Tabel Portofolio Anggota
    await queryRunner.query(`
          CREATE TABLE portofolio_anggota (
            id VARCHAR(36) NOT NULL DEFAULT (UUID()),
            id_portofolio VARCHAR(36) NOT NULL,
            id_user VARCHAR(36) NOT NULL,
            role VARCHAR(100) NOT NULL,
            angkatan VARCHAR(10) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            CONSTRAINT FK_portofolio_anggota_portofolio FOREIGN KEY (id_portofolio) 
              REFERENCES portofolio (id) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT FK_portofolio_anggota_user FOREIGN KEY (id_user) 
              REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
          ) ENGINE=InnoDB;
        `);

    // Tabel Detail Project
    await queryRunner.query(`
          CREATE TABLE detail_project (
            id VARCHAR(36) NOT NULL DEFAULT (UUID()),
            id_portofolio VARCHAR(36) NOT NULL,
            judul_link VARCHAR(255) NOT NULL,
            link_project VARCHAR(512) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            CONSTRAINT FK_detail_project_portofolio FOREIGN KEY (id_portofolio) 
              REFERENCES portofolio (id) ON DELETE CASCADE ON UPDATE CASCADE
          ) ENGINE=InnoDB;
        `);

    // Tabel Tags
    await queryRunner.query(`
          CREATE TABLE tags (
            id VARCHAR(36) NOT NULL DEFAULT (UUID()),
            id_portofolio VARCHAR(36) NOT NULL,
            nama VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            CONSTRAINT FK_tags_portofolio FOREIGN KEY (id_portofolio) 
              REFERENCES portofolio (id) ON DELETE CASCADE ON UPDATE CASCADE
          ) ENGINE=InnoDB;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tags;`);
    await queryRunner.query(`DROP TABLE detail_project;`);
    await queryRunner.query(`DROP TABLE portofolio_anggota;`);
    await queryRunner.query(`DROP TABLE portofolio;`);
  }
}
