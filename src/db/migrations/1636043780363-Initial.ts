import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1636043780363 implements MigrationInterface {
  name = 'Initial1636043780363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`user_id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
