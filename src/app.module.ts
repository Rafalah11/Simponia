import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUserModule } from './profile_user/profile_user.module';
import { ProfileAdminModule } from './profile_admin/profile_admin.module';
import { ProfileAdminCommunityModule } from './profile_admin-community/profile_admin-community.module';
import { PortofolioModule } from './portofolio/portofolio.module';
import { StatusVerifikasiModule } from './status_verifikasi/status_verifikasi.module';
import { LoginModule } from './login/login.module';
import { AuthModule } from './auth/auth.module';
import { AcaraModule } from './acara/acara.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'simponia',
      entities: ['dist/**/*.entity.js'],
      synchronize: false, // Set to false when using migrations
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false, // We'll run migrations manually
    }),
    UserModule,
    ProfileUserModule,
    ProfileAdminModule,
    ProfileAdminCommunityModule,
    PortofolioModule,
    StatusVerifikasiModule,
    LoginModule,
    AuthModule,
    AcaraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
