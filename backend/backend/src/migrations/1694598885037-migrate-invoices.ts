import { MigrationInterface, QueryRunner } from 'typeorm'

export class migrateInvoices1694598885037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE invoice SET "from_metadata" = CONCAT('{ "name": "', (select name from organization where id = invoice.organization_id), '"}')::json WHERE "from_metadata" IS NULL AND role = 'seller';`
    )
    await queryRunner.query(
      `UPDATE invoice SET "to_metadata" = CONCAT('{ "name": "', invoice."counterpartyName", '", "email":"', invoice."counterpartyEmail", '"}')::json WHERE "to_metadata" IS NULL AND role = 'seller';`
    )
    await queryRunner.query(
      `UPDATE invoice SET "from_metadata" = CONCAT('{ "name": "', invoice."counterpartyName", '", "email":"', invoice."counterpartyEmail", '"}')::json WHERE "from_metadata" IS NULL AND role = 'buyer';`
    )
    await queryRunner.query(
      `UPDATE invoice SET "to_metadata" = CONCAT('{ "name": "', (select name from organization where id = invoice.organization_id), '"}')::json WHERE "to_metadata" IS NULL AND role = 'buyer';`
    )
    await queryRunner.query(
      `UPDATE invoice SET status = 'paid' WHERE source = 'request_finance' AND status = 'created';`
    )
    await queryRunner.query(
      `UPDATE invoice SET invoice_details = CONCAT('{ "items":', items::text, '}')::json WHERE invoice_details IS NULL;`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
