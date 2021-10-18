import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUsesRoleColumn1634555233078 implements MigrationInterface {
  name = 'addUsesRoleColumn1634555233078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`role\``);
  }
}
