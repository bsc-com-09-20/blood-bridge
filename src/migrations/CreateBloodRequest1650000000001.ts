import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBloodRequest1650000000001 implements MigrationInterface {
    name = 'CreateBloodRequest1650000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "blood_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "hospitalId" integer NOT NULL,
                "donorId" uuid NOT NULL,
                "bloodType" varchar NOT NULL,
                "quantity" integer NOT NULL,
                "distanceKm" float NOT NULL,
                "status" varchar NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_blood_request" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "blood_request"
            ADD CONSTRAINT "FK_blood_request_donor"
            FOREIGN KEY ("donorId") REFERENCES "donor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "blood_request"
            ADD CONSTRAINT "FK_blood_request_hospital"
            FOREIGN KEY ("hospitalId") REFERENCES "hospital"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blood_request" DROP CONSTRAINT "FK_blood_request_hospital"`);
        await queryRunner.query(`ALTER TABLE "blood_request" DROP CONSTRAINT "FK_blood_request_donor"`);
        await queryRunner.query(`DROP TABLE "blood_request"`);
    }
}
