export const MOCK_DATA_2 = [
  {
    invoiceNumber: 'INV-0001',
    dates: {
      issuedDate: 'Aug 17, 2023',
      dueDate: 'Aug 24, 2023'
    },
    amounts: {
      tokenAmount: 0,
      fiatAmount: 10000
    },
    invoiceStatus: 'pending',
    settlementStatus: 'overdue',
    to: 'Mr Magoo',
    payee: 'Mandal Club',
    address: '31 Bukit Pasoh Rd, Singapore 089845',
    invoiceItems: [
      {
        item: 'Membership fee',
        quantity: 1,
        unitPrice: 1000,
        tax: 0
      },
      {
        item: 'Cat Food',
        quantity: 3,
        unitPrice: 3000,
        tax: 0
      }
    ],
    notes: 'What should I do with the cat?'
  },
  {
    invoiceNumber: 'INV-0002',
    dates: {
      issuedDate: 'Jun 17, 2023',
      dueDate: 'Jun 24, 2023'
    },
    amounts: {
      tokenAmount: 16.4,
      fiatAmount: 27930
    },
    invoiceStatus: 'complete',
    settlementStatus: 'paid',
    to: 'Mrs Gizmo',
    payee: 'Mandal Club',
    address: '31 Bukit Pasoh Rd, Singapore 089845',
    invoiceItems: [
      {
        item: 'Fairy Dust',
        quantity: 10,
        unitPrice: 543,
        tax: 0
      },
      {
        item: 'Magic Wand',
        quantity: 3,
        unitPrice: 7500,
        tax: 0
      }
    ]
  },
  {
    invoiceNumber: 'INV-0003',
    dates: {
      issuedDate: 'Aug 17, 2023',
      dueDate: 'Aug 24, 2023'
    },
    amounts: {
      tokenAmount: 0,
      fiatAmount: 189
    },
    invoiceStatus: 'pending',
    settlementStatus: 'pending',
    to: 'Miss Crunchcrunch',
    payee: 'Mandal Club',
    address: '31 Bukit Pasoh Rd, Singapore 089845',
    invoiceItems: [
      {
        item: 'Yummy Donuts',
        quantity: 54,
        unitPrice: 3.5,
        tax: 0
      }
    ]
  },
  {
    invoiceNumber: 'INV-0004',
    dates: {
      issuedDate: 'Mar 23, 2023',
      dueDate: 'Aug 24, 2023'
    },
    amounts: {
      tokenAmount: 0,
      fiatAmount: 1352.5
    },
    invoiceStatus: 'complete',
    settlementStatus: 'pending',
    to: 'Mr Bean',
    payee: 'Mandal Club',
    address: '31 Bukit Pasoh Rd, Singapore 089845',
    invoiceItems: [
      {
        item: 'Cheese Cake',
        quantity: 15,
        unitPrice: 13.5,
        tax: 0
      },
      {
        item: 'Cookies',
        quantity: 100,
        unitPrice: 1.5,
        tax: 0
      },
      {
        item: 'Bao',
        quantity: 1000,
        unitPrice: 1,
        tax: 0
      }
    ]
  },
  {
    invoiceNumber: 'INV-0005',
    dates: {
      issuedDate: 'Jun 17, 2023',
      dueDate: 'Aug 24, 2023'
    },
    amounts: {
      tokenAmount: 1004,
      fiatAmount: 1000000
    },
    invoiceStatus: 'complete',
    settlementStatus: 'paid',
    to: 'Sir Freyo',
    payee: 'Mandal Club',
    address: '31 Bukit Pasoh Rd, Singapore 089845',
    invoiceItems: [
      {
        item: 'Money, gimme money',
        quantity: 1,
        unitPrice: 1000000,
        tax: 0
      }
    ]
  }
]

export const fakeApiCall2 = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA_2)
    }, 2000)
  })
