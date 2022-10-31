import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropGroupContentPKConstraint1667255434764
  implements MigrationInterface
{
  public name = 'DropGroupContentPKConstraint1667255434764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`group_content\` DROP PRIMARY KEY`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`group_content\` ADD CONSTRAINT group_content_PK PRIMARY KEY (group_id,content_id);`,
    );
  }
}
