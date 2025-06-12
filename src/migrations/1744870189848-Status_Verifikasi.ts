import { MigrationInterface, QueryRunner } from 'typeorm';

export class StatusVerifikasi1744870189848 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE status_verifikasi (
          UniqueID int NOT NULL AUTO_INCREMENT,
          id_portofolio char(36) NOT NULL,
          note text NULL,
          updated_by char(36) NOT NULL,
          profile_user VARCHAR(255) NULL,
          updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (UniqueID)
      );
    `);
    await queryRunner.query(`
      ALTER TABLE status_verifikasi
      ADD CONSTRAINT FK_status_verifikasi_portofolio
      FOREIGN KEY (id_portofolio) REFERENCES portofolio(id)
      ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    await queryRunner.query(`
      ALTER TABLE status_verifikasi
      ADD CONSTRAINT FK_status_verifikasi_users
      FOREIGN KEY (updated_by) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE status_verifikasi DROP FOREIGN KEY FK_status_verifikasi_users`,
    );
    await queryRunner.query(
      `ALTER TABLE status_verifikasi DROP FOREIGN KEY FK_status_verifikasi_portofolio`,
    );
    await queryRunner.query(`DROP TABLE status_verifikasi`);
  }
}
