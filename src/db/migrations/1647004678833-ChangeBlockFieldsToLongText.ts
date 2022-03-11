import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBlockFieldsToLongText1647004678833
  implements MigrationInterface
{
  public name = 'ChangeBlockFieldsToLongText1647004678833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`content\` DROP COLUMN \`blocks\``);
    await queryRunner.query(
      `ALTER TABLE \`content\` ADD \`blocks\` longtext NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notion_block\` DROP COLUMN \`children_blocks\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notion_block\` ADD \`children_blocks\` longtext NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notion_block\` DROP COLUMN \`children_blocks\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notion_block\` ADD \`children_blocks\` text COLLATE "utf8mb4_unicode_ci" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`content\` DROP COLUMN \`blocks\``);
    await queryRunner.query(
      `ALTER TABLE \`content\` ADD \`blocks\` text COLLATE "utf8mb4_unicode_ci" NOT NULL`,
    );
  }
}
