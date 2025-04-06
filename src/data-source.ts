import "reflect-metadata";
import { DataSource } from "typeorm";
import { Donor } from './donor/entities/donor.entity';
import { BloodInventory } from './blood-inventory/entities/blood-inventory.entity';
import { BloodRequest } from './blood-request/entities/blood-request.entity';
import { Hospital } from './hospital/entities/hospital.entity';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    "username": "postgres",
    "password": "m654321",
    "database": "blood_bridge_db",
    synchronize: true, // Set to false in production
    logging: false,
    entities: [Donor, BloodInventory, BloodRequest, Hospital],
    migrations: ["src/migration/*.ts"], 
    subscribers: [],
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });
