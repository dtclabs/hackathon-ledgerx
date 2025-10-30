import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { OrganizationsModule } from '../src/organizations/organizations.module'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../src/auth/auth.module'
import { Organization } from '../src/shared/entity-services/organizations/organization.entity'
import { Account } from '../src/shared/entity-services/account/account.entity'
import { OrganizationsController } from '../src/organizations/organizations.controller'
import { OrganizationsEntityService } from '../src/shared/entity-services/organizations/organizations.entity-service'
import { Connection, Repository } from 'typeorm'
import { getConnection } from './db'
import { Signer } from './sign'
import { CoreModule } from '../src/core/core.module'
import { ConfigModule, ConfigService } from '@nestjs/config'

describe('RecipientsController (e2e)', () => {
  let app: INestApplication
  let connection: Connection
  let configService: ConfigService
  const address = '0x36De3d08157b8Ed6C0eCc45553d0fE918d49e959'

  beforeEach(async () => {
    connection = await getConnection([Organization, Account])
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        OrganizationsModule,
        ConfigModule.forRoot(),
        CoreModule,
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          entities: [Organization, Account]
        })
      ],
      controllers: [OrganizationsController],
      providers: [
        ConfigService,
        OrganizationsEntityService,
        { provide: getRepositoryToken(Organization), useClass: Repository }
      ]
    })
      .overrideProvider(Connection)
      .useValue(connection)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    configService = app.get(ConfigService)
  })

  afterEach(() => {
    connection.close()
  })

  it('/auth (POST)', async () => {
    const userRes = await request(app.getHttpServer()).get(`/user/${address}`)
    const signer = new Signer()
    const nonce = userRes.body.data.nonce
    const signature = await signer.getSigner(configService.get('MNEMONIC')).signMessage(nonce)
    const res = await request(app.getHttpServer()).post('/auth').send({ address, signature })

    expect(res.status).toEqual(201)
    expect(res.body.data).toHaveProperty('access_token')
  })
})
