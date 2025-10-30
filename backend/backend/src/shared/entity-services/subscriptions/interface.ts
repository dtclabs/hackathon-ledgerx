export enum BillingCycle {
  NOT_APPLICABLE = 'not_applicable', // Specific to free_trial
  SEMIANNUALLY = 'semiannually',
  ANNUALLY = 'annually'
}

export enum SubscriptionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum SubscriptionPlanName {
  FREE_TRIAL = 'free_trial',
  STARTER = 'starter',
  BUSINESS = 'business'
}

export enum SubscriptionPlanPermissionName {
  ASSETS = 'assets',
  CHART_OF_ACCOUNTS = 'chart_of_accounts',
  FINANCIAL_TRANSACTIONS = 'financial_transactions',
  INTEGRATIONS = 'integrations',
  INVITATIONS = 'invitations',
  MEMBERS = 'members',
  PAYMENTS = 'payments',
  PAYMENT_LINKS = 'payment_links',
  RECIPIENTS = 'recipients',
  TRANSACTIONS = 'transactions',
  WALLETS = 'wallets',
  WALLET_GROUPS = 'wallet_groups'
}
