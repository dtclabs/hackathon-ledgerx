import { MigrationInterface, QueryRunner } from 'typeorm'

export class additionalIngestionTables1684305659080 implements MigrationInterface {
  name = 'additionalIngestionTables1684305659080'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // create additional tables for ingestion
    await queryRunner.query(
      `CREATE TABLE "contract_configuration" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "contract_address" character varying, "blockchain_id" character varying NOT NULL, "topic0" character varying NOT NULL, "topic1" character varying, "topic2" character varying, "topic3" character varying, CONSTRAINT "PK_04ec62e2dfc570ed77cc653af41" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."ingestion_process_type_enum" AS ENUM('main', 'contract_configuration')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."ingestion_process_status_enum" AS ENUM('created', 'running', 'completed', 'failed', 'terminated')`
    )
    await queryRunner.query(
      `CREATE TABLE "ingestion_process" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."ingestion_process_type_enum" NOT NULL, "status" "public"."ingestion_process_status_enum" NOT NULL DEFAULT 'created', "last_execution_at" TIMESTAMP, "completed_at" TIMESTAMP, "metadata" json, "error" json, "provider" character varying NOT NULL, "sync_type" character varying, "ingestion_workflow_id" bigint, "contract_configuration_id" bigint, CONSTRAINT "PK_dce4439c02c9ad98171a37cdb67" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "evm_log" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "contract_address" character varying NOT NULL, "block_hash" character varying NOT NULL, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "log_index" integer NOT NULL, "topic0" character varying NOT NULL, "topic1" character varying, "topic2" character varying, "topic3" character varying, "data" character varying NOT NULL, "initiator_address" character varying, CONSTRAINT "UQ_ca9268309808259eb1a84a13732" UNIQUE ("blockchain_id", "transaction_hash", "log_index"), CONSTRAINT "PK_46aa4562a71db276862c5960c85" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "wallet_contract_configuration_log" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "address" character varying NOT NULL, "processed_at" TIMESTAMP, "contract_configuration_id" bigint, "evm_log_id" bigint, CONSTRAINT "UQ_eca375b829d0115c1d7d0f72b9b" UNIQUE ("contract_configuration_id", "evm_log_id", "address"), CONSTRAINT "PK_ecb15d7700d01abaad1cb72bc4b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "raw_transaction" ADD "ingestion_process_id" character varying`)
    await queryRunner.query(
      `ALTER TABLE "ingestion_process" ADD CONSTRAINT "FK_ef7cf538aeb6b035eed5803c312" FOREIGN KEY ("ingestion_workflow_id") REFERENCES "ingestion_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ingestion_process" ADD CONSTRAINT "FK_919424a9e43474226600ea2242a" FOREIGN KEY ("contract_configuration_id") REFERENCES "contract_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_contract_configuration_log" ADD CONSTRAINT "FK_1906852fa7a7bf4cfb20d464491" FOREIGN KEY ("contract_configuration_id") REFERENCES "contract_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_contract_configuration_log" ADD CONSTRAINT "FK_3e2bd741cf1b19c9f9d0b3b2ee6" FOREIGN KEY ("evm_log_id") REFERENCES "evm_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    await queryRunner.query(
      `ALTER TABLE "financial_transaction_preprocess" ALTER COLUMN "raw_transaction_id" DROP NOT NULL`
    )

    // Rename table
    await queryRunner.query(`alter table ingestion_task rename to ingestion_workflow`)
    await queryRunner.query(`alter SEQUENCE ingestion_task_id_seq rename to ingestion_workflow_id_seq`)
    await queryRunner.query(`alter type ingestion_task_status_enum rename to ingestion_workflow_status_enum`)

    // Insert contract configurations
    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('WETH Deposit', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'ethereum',
               '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c', 'address_in', null, null)`
    )

    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('WETH Withdrawal', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'ethereum',
               '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65', 'address_out', null, null)`
    )

    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('BNB Burn', '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', 'ethereum',
               '0xcc16f5dbb4873280815c1ee09dbd06736cffcc184412cf7a71a0fdb75d397ca5', 'address_out', null, null)`
    )

    await queryRunner.query(
      `insert into feature_flag (name)
       values ('evm_logs_parser')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename table
    await queryRunner.query(`alter table ingestion_workflow rename to ingestion_task`)
    await queryRunner.query(`alter SEQUENCE ingestion_workflow_id_seq rename to ingestion_task_id_seq`)
    await queryRunner.query(`alter type ingestion_workflow_status_enum rename to ingestion_task_status_enum`)

    // Delete contract configurations preprocess
    await queryRunner.query(`delete from financial_transaction_preprocess where raw_transaction_id is null`)
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_preprocess"
        ALTER COLUMN "raw_transaction_id" SET NOT NULL`
    )

    await queryRunner.query(
      `ALTER TABLE "wallet_contract_configuration_log"
        DROP CONSTRAINT "FK_3e2bd741cf1b19c9f9d0b3b2ee6"`
    )
    await queryRunner.query(
      `ALTER TABLE "wallet_contract_configuration_log"
        DROP CONSTRAINT "FK_1906852fa7a7bf4cfb20d464491"`
    )
    await queryRunner.query(`ALTER TABLE "ingestion_process"
      DROP CONSTRAINT "FK_919424a9e43474226600ea2242a"`)
    await queryRunner.query(`ALTER TABLE "ingestion_process"
      DROP CONSTRAINT "FK_ef7cf538aeb6b035eed5803c312"`)
    await queryRunner.query(`ALTER TABLE "raw_transaction"
      DROP COLUMN "ingestion_process_id"`)
    await queryRunner.query(`DROP TABLE "wallet_contract_configuration_log"`)
    await queryRunner.query(`DROP TABLE "ingestion_process"`)
    await queryRunner.query(`DROP TYPE "public"."ingestion_process_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."ingestion_process_type_enum"`)
    await queryRunner.query(`DROP TABLE "evm_log"`)
    await queryRunner.query(`DROP TABLE "contract_configuration"`)

    await queryRunner.query(`delete
                             from feature_flag
                             where name = 'evm_logs_parser'`)
  }
}
