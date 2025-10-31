import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import RequestIcon from '@/public/svg/logos/request-logo.svg'
import XeroIcon from '@/public/svg/icons/xero-logo-icon.svg'
import DTCPayIcon from '@/public/svg/icons/dtcpay-icon.svg'

export const modalContent = [
  {
    feature: 'Accounting and Reconciliation',
    content: [
      { header: { title: 'Unlimited wallet imports' }, payouts: false, stater: true, business: true, partners: true },
      {
        header: { title: 'Transactions' },
        payouts: false,
        stater: '10,000 / month',
        business: '10,000 / month',
        partners: '10,000 / month'
      },
      {
        header: { title: 'Cost-basis calculations (FIFO, WAC, LIFO)' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      { header: { title: 'Realised G&L tracking' }, payouts: false, stater: true, business: true, partners: true },
      {
        header: { title: 'On-chain transaction history and automatic tracking of ledger entries' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Chart of Accounts via manual import' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Account mapping rule-engine' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      { header: { title: 'Tax Lots tracking' }, payouts: false, stater: true, business: true, partners: true },
      {
        header: { title: 'Tracking of Internal vs External transfers' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      { header: { title: 'Customer reconciliation' }, payouts: false, stater: false, business: false, partners: true }
    ]
  },
  {
    feature: 'Financial Reports',
    content: [
      { header: { title: 'Dashboard view' }, payouts: false, stater: true, business: true, partners: true },
      {
        header: { title: 'Portfolio balances, in/outflows' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Unrealised G&L tracking' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Ledger entries CSV export' },
        payouts: false,
        stater: 'Unlimited',
        business: 'Unlimited',
        partners: 'Unlimited'
      },
      {
        header: { title: 'Tax Lots and Cost-basis tracking CSV export' },
        payouts: false,
        stater: 'Unlimited',
        business: 'Unlimited',
        partners: 'Unlimited'
      },
      {
        header: { title: 'Monthly reconciliation and report generation support' },
        payouts: false,
        stater: false,
        business: true,
        partners: true
      },
      {
        header: { title: 'Multi-entity view' },
        payouts: false,
        stater: false,
        business: false,
        partners: true
      }
    ]
  },
  {
    feature: 'Accounting and ERP Integrations',
    content: [
      { header: { title: 'Xero', icon: XeroIcon }, payouts: false, stater: false, business: true, partners: true },
      {
        header: { title: 'QuickBooks', icon: QuickBooksIcon },
        payouts: false,
        stater: false,
        business: true,
        partners: true
      }
    ]
  },
  {
    feature: 'Crypto Payments',
    content: [
      { header: { title: 'Unlimited bulk payouts' }, payouts: true, stater: true, business: true, partners: true },
      {
        header: { title: 'Address book' },
        payouts: true,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Compatible with Safe, WalletConnect and any non-custodial wallets' },
        payouts: true,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Unlimited payment links' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      }
    ]
  },
  {
    feature: 'User Management',
    content: [
      { header: { title: 'Unlimited seats' }, payouts: false, stater: true, business: true, partners: true },
      {
        header: { title: 'Login with Google, Email or WalletConnect' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Support fot bulk create and import user accounts' },
        payouts: false,
        stater: false,
        business: true,
        partners: true
      }
    ]
  },
  {
    feature: 'Customer Service',
    content: [
      { header: { title: 'Email support' }, payouts: true, stater: true, business: true, partners: true },
      {
        header: { title: 'Dedicated account manager' },
        payouts: false,
        stater: true,
        business: true,
        partners: true
      },
      {
        header: { title: 'Onboarding sessions' },
        payouts: false,
        stater: '2x',
        business: '5x',
        partners: '5x'
      },
      {
        header: { title: 'Consultation' },
        payouts: false,
        stater: '1 hour free',
        business: 'Monthly with manual generation of reports & database',
        partners: 'Monthly with manual generation of reports & database'
      }
    ]
  },
  {
    feature: 'Add-ons',
    content: [
      {
        header: { title: 'Request Finance', icon: RequestIcon },
        payouts: false,
        stater: false,
        business: '$25 USD / month',
        partners: '$25 USD / month'
      },
      {
        header: { title: 'dtcpay', icon: DTCPayIcon },
        payouts: false,
        stater: false,
        business: '$25 USD / month',
        partners: '$25 USD / month'
      }
    ]
  }
]
