export enum FeatureFlagOption {
  SERVER_DEPLOYMENT = 'server_deployment',
  XERO_EXPORT = 'xero_export',
  SUBSCRIPTION_PLAN_PERMISSION = 'subscription_plan_permission',
  COINGECKO_EOD_JOB = 'coingecko_eod_job',
  POLYGON_NEW_INGESTION_PREPROCESS_STRATEGY = 'polygon_new_ingestion_preprocess_strategy',
  NFT_GET_IGNORE_UPDATE_AFTER = 'nft_get_ignore_update_after',
  ENABLE_ROOTFI_SERVICE = 'enable_rootfi_service',
  RETURN_ALL_PENDING_TRANSACTIONS = 'return_all_pending_transactions',
  ENABLE_PLATFORM_ID_MIGRATION = 'enable_platform_id_migration',
  ENABLE_ROOTFI_MIGRATION = 'enable_rootfi_migration',
  DTCPAY = 'dtcpay'
}

export enum EnvironmentEnum {
  LOCALHOST = 'localhost',
  DEVELOPMENT = 'develop',
  STAGING = 'staging',
  PRODUCTION = 'production'
}
