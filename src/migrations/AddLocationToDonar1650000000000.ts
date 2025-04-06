import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToDonar1650000000000 implements MigrationInterface {
    name = 'AddLocationToDonar1650000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "donor" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "bloodGroup" character varying(10) NOT NULL,
                "lastDonation" date,
                "email" character varying NOT NULL,
                "phone" character varying(15) NOT NULL,
                "password" character varying,
                "location" geography(Point,4326),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_donor_email" UNIQUE ("email"),
                CONSTRAINT "PK_donor" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "donor"`);
    }
}
