import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupIDToUsersTable1636810783332 implements MigrationInterface {
  public name = 'AddGroupIDToUsersTable1636810783332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`group_id\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_3c29fba6fe013ec8724378ce7c9\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_3c29fba6fe013ec8724378ce7c9\``,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`group_id\``);
  }
}
