import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfileUserTable1742808129332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE profile_user (
                id VARCHAR(36) NOT NULL DEFAULT (UUID()),
                user_id VARCHAR(36) NOT NULL,
                nama VARCHAR(255) NOT NULL,
                no_handphone VARCHAR(20) NOT NULL,
                gender ENUM('L', 'P') NOT NULL,
                tanggal_lahir DATE NOT NULL,
                kota VARCHAR(255) NOT NULL,
                keterangan TEXT NULL,
                linkedin VARCHAR(255) NULL,
                instagram VARCHAR(255) NULL,
                email VARCHAR(255) NOT NULL,
                github VARCHAR(255) NULL,
                nama_komunitas VARCHAR(255) NULL,
                join_komunitas DATE NULL,
                divisi VARCHAR(255) NULL,
                posisi VARCHAR(255) NULL,
                profile_picture VARCHAR(255) NULL,
                verified_portfolio_count INT DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE INDEX UQ_email (email),
                UNIQUE INDEX UQ_user_id (user_id),
                CONSTRAINT FK_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE profile_user;`);
  }
}
