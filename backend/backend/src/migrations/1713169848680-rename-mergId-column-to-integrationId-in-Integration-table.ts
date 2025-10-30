import { MigrationInterface, QueryRunner } from 'typeorm'

export class renameMergeIdToIntegrationIdInIntegration1713169848680 implements MigrationInterface {
  name = 'renameMergeIdToIntegrationIdInIntegration1713169848680'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integration" RENAME COLUMN "merge_id" TO "integration_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integration" RENAME COLUMN "integration_id" TO "merge_id"`)
  }
}
