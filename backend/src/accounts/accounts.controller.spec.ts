import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { AuthModule } from '../auth/auth.module'
import { Account } from '../shared/entity-services/account/account.entity'
import { AccountsController } from '../shared/entity-services/account/accounts.controller'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { v4 } from 'uuid'
import { getConnection } from '../../test/db'
import { OrganizationsModule } from '../organizations/organizations.module'
import { Organization } from '../shared/entity-services/organizations/organization.entity'
import { OrganizationType } from '../organizations/interfaces'
import { RolesModule } from '../roles/roles.module'
import { Role } from '../shared/entity-services/roles/role.entity'
import { AuthWallet } from '../shared/entity-services/providers/wallet.entity'
import { ProvidersModule } from '../providers/providers.module'
import { Chain } from '../shared/entity-services/chains/chain.entity'
import { Token } from '../shared/entity-services/tokens/token.entity'
import { Group } from '../groups/group.entity'
import { CaslModule } from '../casl/casl.module'
import { SourceOfFund } from '../source-of-funds/source-of-fund.entity'
import { Transaction } from '../transactions/transaction.entity'

describe('AccountsController', () => {
  let accountsController: AccountsController
  let accountsService: AccountsEntityService
  let connection: Connection
  let organization: Organization
  const req = {
    user: {
      id: '1',
      address: '1'
    }
  }

  beforeEach(async () => {
    connection = await getConnection([
      Account,
      Organization,
      SourceOfFund,
      Role,
      AuthWallet,
      Chain,
      Token,
      Group,
      Transaction
    ])

    const app: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        OrganizationsModule,
        CaslModule,
        ProvidersModule,
        RolesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          entities: [Account, Organization, SourceOfFund, Role, AuthWallet, Chain, Token, Group, Transaction]
        })
      ],
      controllers: [AccountsController],
      providers: [
        AccountsEntityService,
        { provide: getRepositoryToken(Account), useClass: Repository },
        { provide: getRepositoryToken(Role), useClass: Repository },
        { provide: getRepositoryToken(AuthWallet), useClass: Repository },
        { provide: getRepositoryToken(Organization), useClass: Repository }
      ]
    })
      .overrideProvider(Connection)
      .useValue(connection)
      .compile()

    const entityManager = connection.createEntityManager()

    accountsController = app.get<AccountsController>(AccountsController)
    accountsService = app.get<AccountsEntityService>(AccountsEntityService)

    await entityManager.insert(AuthWallet, {
      address: '1',
      nonce: v4()
    })

    organization = await entityManager.save(Organization, {
      id: '1',
      type: OrganizationType.COMPANY,
      name: 'Flowstation'
    })

    await entityManager.insert(Account, {
      name: 'Account'
    })
  })

  afterEach(() => {
    return connection.close()
  })

  describe('post account', () => {
    it('should return an account info', async () => {
      // const account = await accountsController.post({ name: 'Account 1' }, organization.publicId, req)
      // expect(account).toMatchObject({
      //   name: 'Account 1',
      //   defaultWalletAddress: '1'
      // })
    })
  })
})
