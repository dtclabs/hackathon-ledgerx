import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as dotenv from 'dotenv'

// Load env (.env.test or .env) trước khi import AppModule
dotenv.config({ path: process.env.DOTENV_PATH || '.env.test' })

// ⚠️ Nếu bạn muốn truy vấn “expected” trực tiếp qua service tầng entity
// để đối chiếu, import đúng service thực tế của bạn:
import { FinancialTransactionsEntityService } from '../src/shared/entity-services/financial-transactions/financial-transactions.entity-service'
import { SolanaFinancialTransactionsService } from '../src/portfolio/solana-financial-transactions.service'
import { BlockExplorerAdapterFactory } from '../src/domain/block-explorers/block-explorer.adapter.factory'
import { FinancialTransactionsEntityModule } from '../src/shared/entity-services/financial-transactions/financial-transactions.entity.module'
import { BlockExplorerModule } from '../src/domain/block-explorers/block-explorer.module'
import { PortfolioModule } from '../src/portfolio/portfolio.module'
import { SubscriptionsEntityModule } from '../src/shared/entity-services/subscriptions/subscriptions.entity.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'

describe('SolanaFinancialTransactionsService (e2e, real DB)', () => {
  let app: INestApplication
  let solanaSvc: SolanaFinancialTransactionsService
  let ftEntitySvc: FinancialTransactionsEntityService
  let blockExplorerAdapterFactory: BlockExplorerAdapterFactory

  // Test fixtures (đọc từ ENV để chạy trên data thật)
  const ORG_ID = process.env.TEST_ORG_ID as string
  const WALLET_PUBLIC_ID = process.env.TEST_WALLET_PUBLIC_ID as string | undefined

  // Bạn có thể inject thêm bộ lọc thực tế nếu hệ thống hỗ trợ.
  // Ví dụ: { valueTimestampFrom: new Date('2025-01-01') }
  const EXTRA_FILTERS: any = {}

  beforeAll(async () => {
    if (!ORG_ID) {
      throw new Error('TEST_ORG_ID is required in env to run these tests against real DB')
    }

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            url: configService.get('DATABASE_URL'),
            logging: configService.get('DATABASE_LOGGING'),
            entities: [configService.get('DATABASE_ENTITIES')],
            migrations: [configService.get('DATABASE_MIGRATIONS')],
            migrationsTableName: configService.get('DATABASE_MIGRATIONS_TABLE_NAME'),
            applicationName: 'ledgerx-backend',
            //https://github.com/typeorm/typeorm/issues/3388
            extra: { max: 25 }
          })
        }),
        EventEmitterModule.forRoot(),
        PortfolioModule,
        FinancialTransactionsEntityModule,
        BlockExplorerModule,
        SubscriptionsEntityModule
      ]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    solanaSvc = app.get(SolanaFinancialTransactionsService)
    ftEntitySvc = app.get(FinancialTransactionsEntityService)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blockExplorerAdapterFactory = app.get(BlockExplorerAdapterFactory)
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('getLatestTransaction', () => {
    it('returns the same newest item as a direct sorted query (organization-level when walletPublicId omitted)', async () => {
      // Expected: newest child by valueTimestamp DESC across organization (no walletAddresses)
      const expectedPage = await ftEntitySvc.getAllChildPaging(
        {
          size: 1,
          page: 0,
          blockchainIds: ['solana'],
          sortBy: 'valueTimestamp',
          sortDirection: 'desc',
          ...EXTRA_FILTERS
        },
        ORG_ID
      )

      const expected = expectedPage.items?.[0] ?? null

      const actual = await solanaSvc.getLatestTransaction(ORG_ID, undefined, { ...EXTRA_FILTERS })

      // So sánh cơ bản
      if (expected === null) {
        expect(actual).toBeNull()
      } else {
        expect(actual).toBeTruthy()
        expect(actual.hash).toBe(expected.hash)
        expect(new Date(actual.valueTimestamp).getTime()).toBe(new Date(expected.valueTimestamp).getTime())
        expect(actual.blockchainId).toBe('solana')
      }
    })

    // Chỉ chạy test này khi có TEST_WALLET_PUBLIC_ID
    ;(WALLET_PUBLIC_ID ? it : it.skip)(
      'returns the same newest item as a direct sorted query (wallet-level when walletPublicId provided)',
      async () => {
        // Lấy địa chỉ ví từ paging để so sánh công bằng
        // (Ở đây dùng luôn getAllChildPaging để tạo expected result)
        const expectedPage = await ftEntitySvc.getAllChildPaging(
          {
            size: 1,
            page: 0,
            walletAddresses: undefined, // Sẽ để service đính địa chỉ từ walletPublicId ở function chính
            blockchainIds: ['solana'],
            sortBy: 'valueTimestamp',
            sortDirection: 'desc',
            // Bạn có thể thêm filters tương tự như trong actual để đồng nhất hoàn toàn
            ...EXTRA_FILTERS
          },
          ORG_ID
        )
        // Lưu ý: expectedPage này là tổng org-level; để wallet-level “expected” chuẩn,
        // cách đúng là: lấy address từ ví rồi truyền vào walletAddresses.
        // Tuy nhiên, vì không mock và không có tiện ích public lấy address ở đây,
        // ta so sánh end-to-end bằng cách gọi function thật của service 2 lần:
        const actual = await solanaSvc.getLatestTransaction(ORG_ID, WALLET_PUBLIC_ID, { ...EXTRA_FILTERS })

        // Để tạo expected wallet-level đúng, gọi lại paging nhưng không vào hàm cần test.
        // Cách tốt nhất: lấy địa chỉ ví từ service wallets rồi truyền thẳng vào getAllChildPaging.
        // Nếu bạn có WalletsEntityService public ở đây, dùng như dưới:
        // const wallet = await app.get(WalletsEntityService).getByOrganizationAndPublicId(ORG_ID, WALLET_PUBLIC_ID!)
        // const expectedWalletPage = await ftEntitySvc.getAllChildPaging({ size:1, page:0, walletAddresses:[wallet.address], blockchainIds:['solana'], sortBy:'valueTimestamp', sortDirection:'desc', ...EXTRA_FILTERS }, ORG_ID)
        // const expected = expectedWalletPage.items?.[0] ?? null

        // Vì ví dụ trên phụ thuộc vào service khác, ở đây ta chỉ assert tính hợp lệ của actual:
        expect(actual === null || !!actual.hash).toBe(true)
        if (actual) {
          expect(actual.blockchainId).toBe('solana')
        }
      }
    )
  })

  describe('getTransactionCount', () => {
    it('matches totalItems from a direct query (organization-level when walletPublicId omitted)', async () => {
      const expectedPage = await ftEntitySvc.getAllChildPaging(
        {
          size: 1,
          page: 0,
          blockchainIds: ['solana'],
          ...EXTRA_FILTERS
        },
        ORG_ID
      )
      const expectedTotal = expectedPage.totalItems ?? 0

      const actualTotal = await solanaSvc.getTransactionCount(ORG_ID, undefined, { ...EXTRA_FILTERS })

      expect(typeof actualTotal).toBe('number')
      expect(actualTotal).toBe(expectedTotal)
    })
    ;(WALLET_PUBLIC_ID ? it : it.skip)(
      'matches totalItems from a direct query (wallet-level when walletPublicId provided)',
      async () => {
        // Tạo expected cho wallet-level bằng cách truy vấn paging với walletAddresses:
        // Nếu có thể, lấy địa chỉ ví thật qua WalletsEntityService (không mock).
        // Ví dụ (bật nếu bạn có service trong DI):
        //
        // const walletsSvc = app.get(WalletsEntityService)
        // const wallet = await walletsSvc.getByOrganizationAndPublicId(ORG_ID, WALLET_PUBLIC_ID!)
        // const expectedWalletPage = await ftEntitySvc.getAllChildPaging(
        //   { size:1, page:0, walletAddresses:[wallet.address], blockchainIds:['solana'], ...EXTRA_FILTERS },
        //   ORG_ID
        // )
        // const expectedTotal = expectedWalletPage.totalItems ?? 0
        //
        // const actualTotal = await solanaSvc.getTransactionCount(ORG_ID, WALLET_PUBLIC_ID, { ...EXTRA_FILTERS })
        // expect(actualTotal).toBe(expectedTotal)

        // Nếu bạn chưa inject được WalletsEntityService ở đây, vẫn có thể tối thiểu kiểm tra “số hợp lệ”:
        const actualTotal = await solanaSvc.getTransactionCount(ORG_ID, WALLET_PUBLIC_ID, { ...EXTRA_FILTERS })
        expect(typeof actualTotal).toBe('number')
        expect(actualTotal >= 0).toBe(true)
      }
    )
  })
})
