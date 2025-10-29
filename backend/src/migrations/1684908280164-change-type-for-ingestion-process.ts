import { MigrationInterface, QueryRunner } from 'typeorm'

export class changeTypeForIngestionProcess1684908280164 implements MigrationInterface {
  name = 'changeTypeForIngestionProcess1684908280164'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ingestion_process"
      alter column type type varchar using type::varchar`)
    await queryRunner.query(`DROP TYPE "public"."ingestion_process_type_enum"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ingestion_process_type_enum" AS ENUM('all_transfers', 'contract_configuration')`
    )
    await queryRunner.query(
      `ALTER TABLE "ingestion_process"
        ALTER COLUMN "type" type "public"."ingestion_process_type_enum" using type::"public"."ingestion_process_type_enum"`
    )
  }
}
