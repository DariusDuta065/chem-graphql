import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserIdField1646534442326 implements MigrationInterface {
  public name = 'ChangeUserIdField1646534442326';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`user_id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`id\` \`user_id\` int NOT NULL AUTO_INCREMENT`,
    );
  }
}
