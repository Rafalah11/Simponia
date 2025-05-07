// typeorm.config.ts
import { DataSource } from 'typeorm';
import { User } from './src/user/entities/user.entity';
import { ProfileUser } from 'src/profile_user/entities/profile_user.entity';

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'simponia',
  entities: [User, ProfileUser],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
