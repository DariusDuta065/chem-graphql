import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserGroupCascade1637238416686 implements MigrationInterface {
  public name = 'FixUserGroupCascade1637238416686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_3c29fba6fe013ec8724378ce7c9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_3c29fba6fe013ec8724378ce7c9\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_3c29fba6fe013ec8724378ce7c9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD CONSTRAINT \`FK_3c29fba6fe013ec8724378ce7c9\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
