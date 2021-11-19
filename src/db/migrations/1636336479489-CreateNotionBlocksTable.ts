import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotionBlocksTable1636336479489
  implements MigrationInterface
{
  public name = 'CreateNotionBlocksTable1636336479489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`notion_block\` (\`block_id\` char(36) NOT NULL, \`is_updating\` tinyint NOT NULL DEFAULT 0, \`last_edited_at\` datetime NOT NULL, \`children_blocks\` text NOT NULL, PRIMARY KEY (\`block_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`notion_block\``);
  }
}
