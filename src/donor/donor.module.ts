import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorService } from './donor.service';
import { DonorController } from './donor.controller';
import { Donor } from './entities/donor.entity';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donor]),
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [DonorController],
  providers: [
    DonorService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    Reflector,
  ],
  exports: [DonorService, TypeOrmModule], // Export both the service and TypeOrmModule
})
export class DonorModule {}
