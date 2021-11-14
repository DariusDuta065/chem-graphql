import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupContentRelation1636827225607
  implements MigrationInterface
{
  public name = 'CreateGroupContentRelation1636827225607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`group_content\` (\`group_id\` int NOT NULL, \`content_id\` int NOT NULL, INDEX \`IDX_5afd612b1d175b6b0fd47011aa\` (\`group_id\`), INDEX \`IDX_c7f732341bd21a3f53abc2fb08\` (\`content_id\`), PRIMARY KEY (\`group_id\`, \`content_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_content\` ADD CONSTRAINT \`FK_5afd612b1d175b6b0fd47011aae\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_content\` ADD CONSTRAINT \`FK_c7f732341bd21a3f53abc2fb08f\` FOREIGN KEY (\`content_id\`) REFERENCES \`content\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`group_content\` DROP FOREIGN KEY \`FK_c7f732341bd21a3f53abc2fb08f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_content\` DROP FOREIGN KEY \`FK_5afd612b1d175b6b0fd47011aae\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c7f732341bd21a3f53abc2fb08\` ON \`group_content\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5afd612b1d175b6b0fd47011aa\` ON \`group_content\``,
    );
    await queryRunner.query(`DROP TABLE \`group_content\``);
  }
}
