export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

// To take effect, you need to manually insert new permission here to the entity file at backend/src/permissions/permission.entity.ts (LedgerX backend)
export enum Resource {
  SOURCE_OF_FUNDS = 'source_of_funds',
  TRANSACTIONS = 'transactions',
  TRANSFERS = 'transfers',
  INVITATIONS = 'invitations',
  RECIPIENTS = 'recipients',
  CATEGORIES = 'categories',
  MEMBERS = 'members',
  PAYMENTS = 'payments',
  PAYMENT_LINKS = 'payment_links',
  PENDING_TRANSACTIONS = 'pending_transactions',
  FINANCIAL_TRANSACTIONS = 'financial_transactions',
  WALLETS = 'wallets',
  WALLET_GROUPS = 'wallet_groups',
  ASSETS = 'assets',
  BALANCES = 'balances',
  CRYPTOCURRENCIES = 'cryptocurrencies',
  SETTINGS = 'settings',
  ORGANIZATIONS = 'organizations',
  ORGANIZATION_INTEGRATIONS = 'organization_integrations',
  INTEGRATION_WHITELIST_REQUESTS = 'integration_whitelist_requests',
  CHART_OF_ACCOUNTS = 'chart_of_accounts',
  CHART_OF_ACCOUNT_MAPPINGS = 'chart_of_account_mappings',
  INTEGRATION_SYNC_REQUESTS = 'integration_sync_requests',
  JOURNAL_ENTRY_EXPORTS = 'journal_entry_exports',
  INVOICES = 'invoices',
  TEMP_TRANSACTIONS = 'temp_transactions',
  FINANCIAL_TRANSACTION_EXPORTS = 'financial_transaction_exports',
  BANK_FEED_EXPORTS = 'bank_feed_exports',
  EXPORT_WORKFLOWS = 'export_workflows',
  NFTS = 'nfts'
}
