import { COAType } from './chart-of-account.entity'

export const seedChartOfAccountForOrganizationList = [
  {
    name: 'Sales',
    type: COAType.REVENUE,
    code: '200',
    description: 'Income from any normal business activity'
  },
  {
    name: 'Interest Income',
    type: COAType.REVENUE,
    code: '270',
    description: 'Interest income from amount paid to the business for lending or letting another entity use its funds'
  },
  {
    name: 'Other Income',
    type: COAType.REVENUE,
    code: '260',
    description: `Income that does not come from a company’s main business, such as rental income.`
  },
  {
    name: 'Refunds',
    type: COAType.REVENUE,
    code: '280',
    description: 'Repayment of funds from an original payee to the business'
  },
  {
    name: 'Reimbursement',
    type: COAType.REVENUE,
    code: '290',
    description: 'Reimbursement of funds from another entity for payments made by the business'
  },
  {
    name: 'Advertising & Marketing',
    type: COAType.EXPENSE,
    code: '400',
    description: 'Expenses incurred for advertising while trying to increase sales'
  },
  {
    name: 'Entertainment',
    type: COAType.REVENUE,
    code: '420',
    description: 'Expenses paid by company for the business but are not deductable for income tax purposes.'
  },
  {
    name: 'Office Expenses',
    type: COAType.EXPENSE,
    code: '453',
    description:
      'General expenses related to the running of the business office (e.g. Stationeries/Office Cleaning/Office Pantry)'
  },
  {
    name: 'General Expenses',
    type: COAType.EXPENSE,
    code: '429',
    description: 'General expenses related to the running of the business (e.g. Liability Insurance)'
  },
  {
    name: 'Vendor/Supplier Expenses',
    type: COAType.EXPENSE,
    code: '412',
    description: 'Expenses related to paying consultants'
  },
  {
    name: 'Rent',
    type: COAType.EXPENSE,
    code: '469',
    description: 'The payment to lease a building or area.'
  },
  {
    name: 'Subscriptions',
    type: COAType.EXPENSE,
    code: '485',
    description: 'Expenses related to subscriptions e.g. Publications/Software Subscriptions'
  },
  {
    name: 'Utilities',
    type: COAType.EXPENSE,
    code: '445',
    description: 'Expenses related to common utilities e.g. Telephone/Internet/Electricity/Water'
  },
  {
    name: 'Training',
    type: COAType.EXPENSE,
    code: '460',
    description: 'Expenses related to training employees for business needs'
  },
  {
    name: 'Travel - International',
    type: COAType.EXPENSE,
    code: '493',
    description: 'Expenses incurred from international travel which has a business purpose'
  },
  {
    name: 'Local Transport',
    type: COAType.EXPENSE,
    code: '494',
    description: 'Expenses incurred from local travel which has a business purpose'
  },
  {
    name: 'Wages & Salaries',
    type: COAType.EXPENSE,
    code: '477',
    description: 'Payment to employees in exchange for their resources'
  },
  {
    name: 'Transaction Fees',
    type: COAType.EXPENSE,
    code: '405',
    description: 'Fees charged for transactions made by business wallets/accounts'
  },
  {
    name: 'Other Contract Interaction Fee',
    type: COAType.EXPENSE,
    code: '406',
    description: 'Fees paid to interact with contracts e.g. Setting Spend Limit Approvals/Rebase Staking'
  },
  {
    name: 'Crypto Swap Fee',
    type: COAType.EXPENSE,
    code: '407',
    description: 'Fees Paid for Crypto Swaps'
  },
  {
    name: 'Off-ramp fee',
    type: COAType.EXPENSE,
    code: '408',
    description: 'Fees Paid for off-ramp'
  }
]
