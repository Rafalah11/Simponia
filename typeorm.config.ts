// typeorm.config.ts
import { DataSource } from 'typeorm';
import { User } from './src/user/entities/user.entity';
import { ProfileUser } from 'src/profile_user/entities/profile_user.entity';
import { ProfileAdmin } from 'src/profile_admin/entities/profile_admin.entity';
import { ProfileAdminCommunity } from 'src/profile_admin-community/entities/profile_admin-community.entity';
import { Portofolio } from 'src/portofolio/entities/portofolio.entity';
import { Acara } from 'src/acara/entities/acara.entity';
import { AnggotaAcara } from 'src/anggota-acara/entities/anggota-acara.entity';
import { DetailProject } from 'src/detail-project/entities/detail-project.entity/detail-project.entity';
import { Tag } from 'src/tags/entities/tag.entity/tag.entity';
import { PortofolioAnggota } from 'src/portofolio-anggota/entities/portofolio-anggota.entity/portofolio-anggota.entity';
import { StatusVerifikasi } from 'src/status_verifikasi/entities/status_verifikasi.entity';

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'simponia',
  entities: [
    User,
    ProfileUser,
    ProfileAdmin,
    ProfileAdminCommunity,
    Portofolio,
    PortofolioAnggota,
    Acara,
    AnggotaAcara,
    DetailProject,
    Tag,
    StatusVerifikasi,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
