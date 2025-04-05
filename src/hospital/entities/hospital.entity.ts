import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';
  
  @Entity()
  export class Hospital {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    @IsEmail()
    email: string;
  
    @Column({ select: false })
    @IsString()
    password: string;
  
    @Column('float', { nullable: true })
    @IsOptional()
    @IsNumber()
    latitude?: number;
  
    @Column('float', { nullable: true })
    @IsOptional()
    @IsNumber()
    longitude?: number;
  
    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    geohash?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  