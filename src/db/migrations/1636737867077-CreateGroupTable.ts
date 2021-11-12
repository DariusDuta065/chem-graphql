import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupTable1636737867077 implements MigrationInterface {
  public name = 'CreateGroupTable1636737867077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`group\` (\`id\` int NOT NULL AUTO_INCREMENT, \`grade\` tinyint NOT NULL, \`notes\` varchar(255) NULL, \`schedule_day\` tinyint NOT NULL, \`schedule_hour\` tinyint NOT NULL, \`schedule_minute\` tinyint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`group\``);
  }
}
