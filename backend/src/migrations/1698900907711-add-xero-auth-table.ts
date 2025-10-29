import { MigrationInterface, QueryRunner } from 'typeorm'

export class addXeroAuthTable1698900907711 implements MigrationInterface {
  name = 'addXeroAuthTable1698900907711'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_xero" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying, "xero_user_id" character varying NOT NULL, "account_id" bigint, CONSTRAINT "UQ_ec34eff0c95e12a969f0eeb600e" UNIQUE ("xero_user_id"), CONSTRAINT "PK_5ccf1628415c0123cf412f2f433" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_ec34eff0c95e12a969f0eeb600" ON "auth_xero" ("xero_user_id") `)
    await queryRunner.query(
      `ALTER TABLE "auth_xero" ADD CONSTRAINT "FK_2947608c205e2a4e933f1e76450" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth_xero" DROP CONSTRAINT "FK_2947608c205e2a4e933f1e76450"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ec34eff0c95e12a969f0eeb600"`)
    await queryRunner.query(`DROP TABLE "auth_xero"`)
  }
}
