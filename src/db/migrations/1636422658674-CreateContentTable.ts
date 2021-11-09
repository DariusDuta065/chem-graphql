import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContentTable1636422658674 implements MigrationInterface {
  name = 'CreateContentTable1636422658674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`content\` (\`id\` int NOT NULL AUTO_INCREMENT, \`block_id\` char(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`last_edited_at\` datetime NOT NULL, \`blocks\` text NOT NULL, UNIQUE INDEX \`IDX_7d42d8b42d978acef6d134064f\` (\`block_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_7d42d8b42d978acef6d134064f\` ON \`content\``,
    );
    await queryRunner.query(`DROP TABLE \`content\``);
  }
}
