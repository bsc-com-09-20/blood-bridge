import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { Donor } from 'src/donor/entities/donor.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donor, Hospital]), // Add this line
    JwtModule.register({
      secret: 'your-secret-key', // Use environment variable in production
      signOptions: { expiresIn: '1d' },
    }),
  ],
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