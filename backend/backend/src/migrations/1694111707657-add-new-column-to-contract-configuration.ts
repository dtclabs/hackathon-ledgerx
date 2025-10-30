import { MigrationInterface, QueryRunner } from 'typeorm'

export class addNewColumnToContractConfiguration1694111707657 implements MigrationInterface {
  name = 'addNewColumnToContractConfiguration1694111707657'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contract_configuration"
        ADD "metadata" json`)

    // Insert contract configurations
    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3, metadata)
       values ('MRC20 Deposit', '0x0000000000000000000000000000000000001010', 'polygon',
               '0x4e2ca0515ed1aef1395f66b5303bb5d6f1bf9d61a353fa53f73f8ac9973fa9f6', 'address_out', 'address_in', null,
               '{"parameterName": "amount", "abi": [{"indexed":true, "internalType":"address", "name":"token", "type":"address"}, {"indexed":true, "internalType":"address", "name":"from", "type":"address"}, {"indexed":false, "internalType":"uint256", "name":"amount", "type":"uint256"}, {"indexed":false, "internalType":"uint256", "name":"input1", "type":"uint256"},{"indexed":false, "internalType":"uint256", "name":"output1", "type":"uint256"}]}')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contract_configuration"
        DROP COLUMN "metadata"`)

    await queryRunner.query(`delete
                             from contract_configuration
                             where blockchain_id = 'polygon'
                               and contract_address = '0x0000000000000000000000000000000000001010'
                               and topic0 = '0x4e2ca0515ed1aef1395f66b5303bb5d6f1bf9d61a353fa53f73f8ac9973fa9f6'`)
  }
}
