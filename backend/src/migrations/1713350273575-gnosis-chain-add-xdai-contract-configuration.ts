import { MigrationInterface, QueryRunner } from 'typeorm'

export class gnosisChainAddXdaiContractConfiguration1713350273575 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('xdai Deposit', '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', 'gnosis_chain',
               '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c', 'address_in', null, null)`
    )

    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('xdai Withdrawal', '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', 'gnosis_chain',
               '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65', 'address_out', null, null)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete
                             from postgres.public.contract_configuration
                             where blockchain_id = 'gnosis_chain'
                               and contract_address = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'`)
  }
}
