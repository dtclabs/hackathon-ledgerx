import { MigrationInterface, QueryRunner } from 'typeorm'

export class polygonAddNewContractConfiguration1698999858289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id, topic0, topic1, topic2, topic3, metadata) values ('MRC20 LogTransfer', '0x0000000000000000000000000000000000001010', 'polygon', '0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4', '0x0000000000000000000000000000000000000000000000000000000000001010', 'address_out', 'address_in', '{"parameterName":"amount","abi":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"input2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output1","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"output2","type":"uint256"}]}')`
    )

    await queryRunner.query(
      `insert into feature_flag (name, is_enabled) values ('polygon_new_ingestion_preprocess_strategy', false)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `delete from contract_configuration where blockchain_id = 'polygon' and topic0 = '0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4'`
    )
    await queryRunner.query(`delete from feature_flag where name = 'polygon_new_ingestion_preprocess_strategy'`)
  }
}
