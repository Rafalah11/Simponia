import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { DatabaseModule } from './database/database.module';
import { AnggotaAcaraModule } from './anggota-acara/anggota-acara.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'simponia1',
      entities: ['dist/**/*.entity.js'],
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'Uploads', 'user'),
      serveRoot: '/uploads/user',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
        cacheControl: true,
        dotfiles: 'deny',
        etag: true,
        lastModified: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'Uploads', 'acara'),
      serveRoot: '/uploads/acara',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
        cacheControl: true,
        dotfiles: 'deny',
        etag: true,
        lastModified: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'Uploads', 'admin'),
      serveRoot: '/uploads/admin',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
        cacheControl: true,
        dotfiles: 'deny',
        etag: true,
        lastModified: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'Uploads', 'admin-community'),
      serveRoot: '/uploads/admin-community',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
        cacheControl: true,
        dotfiles: 'deny',
        etag: true,
        lastModified: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'Uploads', 'portofolio'),
      serveRoot: '/uploads/portofolio',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
        cacheControl: true,
        dotfiles: 'deny',
        etag: true,
        lastModified: true,
      },
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
    DatabaseModule,
    AnggotaAcaraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
          res.header(
            'Access-Control-Allow-Methods',
            'GET,POST,PUT,DELETE,OPTIONS',
          );
          res.header(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization',
          );
          res.status(200).end();
        } else {
          next();
        }
      })
      .forRoutes('*');
  }
}
