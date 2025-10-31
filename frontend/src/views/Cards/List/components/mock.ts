import {
  CardStatus,
  CardTransactionStatus,
  CardTransactionType,
  ICard,
  ICardTransaction
} from '@/slice/cards/cards-type'

export const CARDS: ICard[] = [
  {
    annotations: [{ id: '1', name: 'Marketing' }],
    cardHolder: {
      id: '1',
      contactNumber: '0123456789',
      name: 'Dai Trinh'
    },
    assignee: 'Dai Trinh',
    truncatedNumber: '****1234',
    id: '1',
    displayName: 'Marketing Spend',
    status: CardStatus.ACTIVE
  },
  {
    annotations: [
      { id: '1', name: 'Marketing' },
      { id: '2', name: 'Marketing1' },
      { id: '3', name: 'Marketing2' },
      { id: '3', name: 'Marketing4' }
    ],
    cardHolder: {
      id: '1',
      contactNumber: '0123456789',
      name: 'Nate'
    },
    assignee: 'Nate',
    truncatedNumber: '****9999',
    id: '2',
    displayName: 'Salary Payment',
    status: CardStatus.LOCKED
  }
]

export const CARD_TRANSACTIONS: ICardTransaction[] = [
  {
    id: '1',
    card: CARDS[0],
    requestedAmount: '123.466',
    requestedCurrency: {
      code: 'USD',
      name: 'USDollar',
      symbol: '$'
    },
    type: CardTransactionType.CHARGE,
    status: CardTransactionStatus.COMPLETED,
    timestamp: new Date(2024, 7, 1).toISOString(),
    metadata: {
      description: 'Amazon Web Services'
    }
  },
  {
    id: '2',
    card: CARDS[0],
    requestedAmount: '999',
    requestedCurrency: {
      code: 'USD',
      name: 'USDollar',
      symbol: '$'
    },
    type: CardTransactionType.CHARGE,
    status: CardTransactionStatus.DECLINED,
    timestamp: new Date(2024, 6, 1).toISOString(),
    metadata: {
      description: 'Amazon Web Services'
    }
  },
  {
    id: '3',
    card: CARDS[1],
    requestedAmount: '1500000',
    requestedCurrency: {
      code: 'USD',
      name: 'USDollar',
      symbol: '$'
    },
    type: CardTransactionType.CHARGE,
    status: CardTransactionStatus.REVERTED,
    timestamp: new Date(2024, 5, 1).toISOString(),
    metadata: {
      description: 'Amazon Web Services'
    }
  },
  {
    id: '4',
    card: CARDS[1],
    requestedAmount: '1000',
    requestedCurrency: {
      code: 'USD',
      name: 'USDollar',
      symbol: '$'
    },
    type: CardTransactionType.CHARGE,
    status: CardTransactionStatus.PENDING,
    timestamp: new Date(2024, 4, 1).toISOString(),
    metadata: {
      description: 'Foodpanda'
    }
  },
  {
    id: '5',
    card: CARDS[1],
    requestedAmount: '1000',
    requestedCurrency: {
      code: 'USD',
      name: 'USDollar',
      symbol: '$'
    },
    type: CardTransactionType.REFUND,
    status: CardTransactionStatus.COMPLETED,
    timestamp: new Date(2024, 4, 1).toISOString(),
    metadata: {
      description: 'Amazon Web Services'
    }
  }
]
