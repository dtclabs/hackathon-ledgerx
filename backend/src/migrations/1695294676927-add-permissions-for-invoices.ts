import { MigrationInterface, QueryRunner } from 'typeorm'

const actions = ['create', 'update']
const roles = ['Owner', 'Admin']

export class addPermissionsForInvoices1695294676927 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const action of actions) {
      for (const role of roles) {
        await queryRunner.query(
          `INSERT INTO permission(resource, action, role_id) VALUES ('invoices', '${action}', (SELECT id FROM role WHERE name='${role}')) ON CONFLICT DO NOTHING`
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const action of actions) {
      for (const role of roles) {
        await queryRunner.query(
          `DELETE FROM permission WHERE resource='invoices' AND action='${action}' AND role_id IN (SELECT id FROM role WHERE name='${role}')`
        )
      }
    }
  }
}
