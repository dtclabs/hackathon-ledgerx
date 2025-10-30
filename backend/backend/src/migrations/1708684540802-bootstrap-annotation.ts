import { MigrationInterface, QueryRunner } from "typeorm";

export class bootstrapAnnotation1708684540802 implements MigrationInterface {
    name = 'bootstrapAnnotation1708684540802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "annotation" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL, "organization_id" character varying, "created_by" character varying, "updated_by" character varying, "deleted_by" character varying, CONSTRAINT "UQ_a561fa5719e0b38cd8e2c2473a3" UNIQUE ("public_id"), CONSTRAINT "UQ_annotation_organizationId_publicId" UNIQUE ("organization_id", "public_id"), CONSTRAINT "PK_ec39ebae82efb7cfc77302eb7b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "financial_transaction_child_annotation" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" character varying, "deleted_by" character varying, "annotation_id" bigint, "financial_transaction_child_id" bigint, CONSTRAINT "PK_0fb7ffc08fa5e36b85c09a9231b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_resourceAnnotation_resource_annotation" ON "financial_transaction_child_annotation" ("financial_transaction_child_id", "annotation_id") `);
        await queryRunner.query(`ALTER TABLE "payment" ADD "annotation_public_ids" json`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_annotation" ADD CONSTRAINT "FK_1c1ee947f1f6014e4ad0601eb7d" FOREIGN KEY ("annotation_id") REFERENCES "annotation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_annotation" ADD CONSTRAINT "FK_f7ad59706d704c269929e783fcc" FOREIGN KEY ("financial_transaction_child_id") REFERENCES "financial_transaction_child"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_annotation" DROP CONSTRAINT "FK_f7ad59706d704c269929e783fcc"`);
        await queryRunner.query(`ALTER TABLE "financial_transaction_child_annotation" DROP CONSTRAINT "FK_1c1ee947f1f6014e4ad0601eb7d"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "annotation_public_ids"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_resourceAnnotation_resource_annotation"`);
        await queryRunner.query(`DROP TABLE "financial_transaction_child_annotation"`);
        await queryRunner.query(`DROP TABLE "annotation"`);
    }

}
