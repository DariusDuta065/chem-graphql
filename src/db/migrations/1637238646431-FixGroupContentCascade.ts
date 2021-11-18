import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixGroupContentCascade1637238646431 implements MigrationInterface {
  public name = 'FixGroupContentCascade1637238646431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_3c29fba6fe013ec8724378ce7c9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_content\` DROP FOREIGN KEY \`FK_c7f732341bd21a3f53abc2fb08f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_3c29fba6fe013ec8724378ce7c9\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_content\` ADD CONSTRAINT \`FK_c7f732341bd21a3f53abc2fb08f\` FOREIGN KEY (\`content_id\`) REFERENCES \`content\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`group_content\` DROP FOREIGN KEY \`FK_c7f732341bd21a3f53abc2fb08f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_3c29fba6fe013ec8724378ce7c9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_content\` ADD CONSTRAINT \`FK_c7f732341bd21a3f53abc2fb08f\` FOREIGN KEY (\`content_id\`) REFERENCES \`content\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_3c29fba6fe013ec8724378ce7c9\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
