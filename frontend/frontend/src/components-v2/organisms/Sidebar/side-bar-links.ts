import type { INavMenuSection } from './sidebar.types'

export const ROUTES: INavMenuSection[] = [
  {
    title: '',
    routes: [
      {
        active: true,
        icon: 'DashboardIcon',
        title: 'Dashboard',
        match: 'Dashboard',
        path: '/dashboard',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      }
    ]
  },
  {
    title: 'Payments',
    icon: 'NewTransferIcon',
    whitelistEnvironment: ['localhost', 'development', 'staging', 'production'],
    routes: [
      {
        active: true,
        icon: 'NewTransferIcon',
        title: 'Payouts',
        match: 'Payouts',
        path: '',
        children: [
          {
            active: true,
            icon: 'NewTransferIcon',
            title: 'Drafts',
            path: '/transact/drafts',
            match: 'Transfer',
            blacklistRole: ['Employee'],
            description:
              'Overview of your balances, transaction records requiring your attention and other quick actions'
          },
          {
            active: true,
            icon: 'NewTransferIcon',
            title: 'Make Payment',
            path: '/transfer',
            match: 'Transfer',
            blacklistRole: ['Employee'],
            description:
              'Overview of your balances, transaction records requiring your attention and other quick actions'
          },
          {
            active: true,
            icon: 'NewTransferIcon',
            title: 'History',
            path: '/transact/payment-history',
            match: 'Transfer',
            blacklistRole: ['Employee'],
            description:
              'Overview of your balances, transaction records requiring your attention and other quick actions'
          }
        ]
      },
      // {
      //   active: true,
      //   icon: 'PendingApprovalIcon',
      //   title: 'Pending Approval',
      //   match: 'Pending Approval',
      //   path: '/pendingApproval',
      //   blacklistRole: ['Employee'],
      //   description: 'Pending Approval for your transactions'
      // },
      {
        active: true,
        icon: 'InvoiceIcon',
        title: 'Invoices',
        match: 'Invoices',
        path: '/invoices',
        blacklistRole: ['Employee'],
        description: 'Invoices',
        whitelistEnvironment: ['localhost', 'development', 'staging', 'production', 'demo']
      },
      {
        active: true,
        icon: 'RecievePayment',
        title: 'Payment Links',
        path: '/payme',
        match: 'Payment Links',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      }

      // {
      //   active: true,
      //   icon: 'TransactionIcon',
      //   title: 'Swap',
      //   match: 'Swap',
      //   path: '/swap',
      //   blacklistRole: ['Employee'],
      //   description: 'Swap',
      //   whitelistEnvironment: ['localhost', 'development', 'staging', 'production', 'demo']
      // },
      // {
      //   active: true,
      //   icon: 'PendingApprovalIcon',
      //   title: 'Cards',
      //   match: 'Cards',
      //   path: '/cards',
      //   description: 'Manage your HQ cards',
      //   whitelistEnvironment: ['localhost'],
      //   children: [
      //     {
      //       active: true,
      //       icon: 'PendingApprovalIcon',
      //       title: 'All Cards',
      //       path: '/cards/list',
      //       match: 'Transfer',
      //       blacklistRole: ['Employee'],
      //       description:
      //         'Overview of your balances, transaction records requiring your attention and other quick actions'
      //     },
      //     {
      //       active: true,
      //       icon: 'PendingApprovalIcon',
      //       title: 'Account',
      //       path: '/cards/account',
      //       match: 'Transfer',
      //       blacklistRole: ['Employee'],
      //       description:
      //         'Overview of your balances, transaction records requiring your attention and other quick actions'
      //     }
      //   ]
      // }
    ]
  },
  {
    title: 'Payments',
    whitelistEnvironment: [''],
    routes: [
      {
        active: true,
        icon: 'NewTransferIcon',
        title: 'Make Payment',
        path: '/transfer',
        match: 'Transfer',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'NewTransferIcon',
        title: 'Create Draft',
        path: '/transfer/create-draft',
        match: 'Transfer',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'RecievePayment',
        title: 'Receive Payment',
        path: '/payme',
        match: 'Receive Payment',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'PendingApprovalIcon',
        title: 'Pending Approval',
        match: 'Pending Approval',
        path: '/pendingApproval',
        blacklistRole: ['Employee'],
        description: 'Pending Approval for your transactions'
      },
      {
        active: true,
        icon: 'InvoiceIcon',
        title: 'Invoices',
        match: 'Invoices',
        path: '/invoices',
        blacklistRole: ['Employee'],
        description: 'Invoices',
        whitelistEnvironment: ['localhost', 'development', 'staging']
      }
    ]
  },
  {
    title: 'Reporting',
    routes: [
      {
        active: true,
        icon: 'TransactionIcon',
        title: 'Transactions',
        match: 'Transaction Records',
        path: '/transactions',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'SourceIcon',
        title: 'Wallets',
        match: 'Wallets',
        path: '/wallets',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      // {
      //   active: true,
      //   icon: 'AssetIcon',
      //   title: 'Assets',
      //   match: 'Assets',
      //   path: '/assets',
      //   blacklistRole: ['Employee'],
      //   description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      // },
      // {
      //   active: true,
      //   icon: 'CategoryIcon',
      //   title: 'Categories',
      //   match: 'Categories',
      //   path: '/categories',
      //   blacklistRole: ['Employee'],
      //   whitelistEnvironment: [''],
      //   description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      // },
      {
        active: true,
        icon: 'NFTIcon',
        title: 'Tokens',
        match: 'Tokens',
        path: '/nfts',
        blacklistRole: ['Employee'],
        whitelistEnvironment: ['localhost', 'development', 'staging', 'production', 'demo'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'CategoryIcon',
        title: 'Chart of Accounts',
        match: 'Chart of Accounts',
        path: '/chart-of-accounts',
        blacklistRole: ['Employee'],
        whitelistEnvironment: ['localhost', 'development', 'staging', 'production'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      }
    ]
  },
  {
    title: 'More',
    routes: [
      {
        active: true,
        icon: 'ContactIcon',
        title: 'Address Book',
        match: 'Contacts',
        path: '/contacts',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'MembersIcon',
        title: 'Members',
        match: 'Members',
        path: '/members',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      },
      {
        active: true,
        icon: 'IntegrationIcon',
        title: 'Integrations',
        match: 'Integrations',
        path: '/integrations',
        blacklistRole: ['Employee'],
        description: 'Overview of your integrations',
        whitelistEnvironment: ['localhost', 'development', 'staging', 'production']
      },
      {
        active: true,
        icon: 'SettingIcon',
        title: 'Settings',
        match: 'Settings',
        path: '/orgsettings',
        blacklistRole: ['Employee'],
        description: 'Overview of your balances, transaction records requiring your attention and other quick actions'
      }
    ]
  }
]
