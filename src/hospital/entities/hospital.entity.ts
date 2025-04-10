import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Point } from 'geojson';

@Entity()
export class Hospital {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  // Add location as GeoJSON Point
  @Column({ type: 'json', nullable: true })
  location: Point; // Hospital location as a GeoJSON Point

  @Column({ type: 'float', nullable: true })
 latitude: number;

@Column({ type: 'float', nullable: true })
longitude: number;


  // Add any other fields your Hospital entity might need
}