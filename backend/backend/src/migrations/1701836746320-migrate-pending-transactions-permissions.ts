import { MigrationInterface, QueryRunner } from 'typeorm'

export class migratePendingTransactionsPermissions1701836746320 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO permission (resource, action, role_id) 
        SELECT 'pending_transactions', 'read', role_id 
            FROM permission 
            WHERE resource = 'financial_transactions' 
                AND action = 'read' 
                AND role_id NOT IN (SELECT role_id FROM permission WHERE resource = 'pending_transactions' AND action = 'read')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM permission WHERE resource = 'pending_transactions' AND action = 'read'`)
  }
}
