import { MigrationInterface, QueryRunner } from 'typeorm'

export class gnosisChainAddCustomLogs1713242288675 implements MigrationInterface {
  name = 'gnosisChainAddCustomLogs1713242288675'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "gnosis_custom_log"
                             (
                               "id"                BIGSERIAL         NOT NULL,
                               "created_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"        TIMESTAMP,
                               "contract_address"  character varying NOT NULL,
                               "block_number"      integer           NOT NULL,
                               "block_timestamp"   character varying NOT NULL,
                               "transaction_hash"  character varying NOT NULL,
                               "log_index"         integer           NOT NULL,
                               "topic0"            character varying NOT NULL,
                               "topic1"            character varying,
                               "topic2"            character varying,
                               "topic3"            character varying,
                               "data"              character varying NOT NULL,
                               "initiator_address" character varying,
                               "from_address"      character varying,
                               "to_address"        character varying,
                               "value"             character varying NOT NULL,
                               CONSTRAINT "UQ_gnosis_custom_log_transaction_hash_log_index" UNIQUE ("transaction_hash", "log_index"),
                               CONSTRAINT "PK_0990fc6f6e1876e728611481ad0" PRIMARY KEY ("id")
                             )`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gnosis_custom_log"`)
  }
}
