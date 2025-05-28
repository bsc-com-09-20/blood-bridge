import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { Donor } from 'src/donor/entities/donor.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([Donor, Hospital]), // Add this line
    JwtModule.register({
      secret: 'your-secret-key', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [JwtModule, AuthService], // Export JwtModule
})
export class AuthModule {}