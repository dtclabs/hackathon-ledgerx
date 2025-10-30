import { MigrationInterface, QueryRunner } from "typeorm";

export class addTaxLotIdIndexToTaxLotSaleTable1694340306919 implements MigrationInterface {
    name = 'addTaxLotIdIndexToTaxLotSaleTable1694340306919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_tax_lot_sale_taxLotId" ON "tax_lot_sale" ("tax_lot_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_tax_lot_sale_taxLotId"`);
    }

}
