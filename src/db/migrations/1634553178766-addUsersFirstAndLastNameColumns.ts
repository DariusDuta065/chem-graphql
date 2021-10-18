import {MigrationInterface, QueryRunner} from "typeorm";

export class addUsersFirstAndLastNameColumns1634553178766 implements MigrationInterface {
    name = 'addUsersFirstAndLastNameColumns1634553178766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`firstName\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`lastName\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`lastName\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`firstName\``);
    }

}
