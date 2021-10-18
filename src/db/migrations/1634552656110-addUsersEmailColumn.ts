import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUsersEmailColumn1634552656110 implements MigrationInterface {
  name = 'addUsersEmailColumn1634552656110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`username\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`email\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`username\` varchar(255) NOT NULL`,
    );
  }
}
