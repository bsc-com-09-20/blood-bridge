// src/blood-type/commands/seed-blood-groups.command.ts
import { Command, CommandRunner } from 'nest-commander';
import { BloodGroupSeederService } from '../seeders/blood-type-seeders';


@Command({ name: 'seed:blood-groups', description: 'Seed blood groups data' })
export class SeedBloodGroupsCommand extends CommandRunner {
  constructor(private readonly seederService: BloodGroupSeederService) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting blood groups seeding...');
    await this.seederService.seedBloodGroups();
    console.log('Blood groups seeding completed!');
  }
}