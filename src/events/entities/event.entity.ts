/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 100 })
    title: string;
  
    @Column({ type: 'text' })
    description: string;
  
    @Column({ type: 'timestamp' })
    eventDate: Date;
  
    @Column({ nullable: true })
    location: string;
  
    @Column({ default: false })
    isPublished: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
