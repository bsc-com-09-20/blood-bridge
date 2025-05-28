// src/settings/entities/setting.entity.ts
/*import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true }) // 👈 Updated here to allow null values
  donorId: string;

  @Column('jsonb', { default: {} })
  preferences: Record<string, any>;

  @Column('jsonb', { default: {} })
  notifications: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} */
