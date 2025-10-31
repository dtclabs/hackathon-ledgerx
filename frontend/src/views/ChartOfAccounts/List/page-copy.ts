import SuccessIcon from '@/public/svg/icons/success-icon.svg'
import XeroLogoIcon from '@/public/svg/icons/xero-logo-icon.svg'
import AddIcon from '@/public/svg/icons/add-icon-white.svg'
import BlackAddIcon from '@/public/svg/icons/add-icon.svg'
import CsvIcon from '@/public/svg/icons/csv-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'

export const PAGE_CONTENT_MAP = {
  xero: {
    completed: {
      title: 'Connected to Xero',
      subTitle: 'Please proceed to import your accounts',
      ctaLabel: 'Import Chart of Accounts',
      isCtaDisabled: false,
      icon: XeroLogoIcon,
      dropdown: {
        label: 'Update',
        icon: XeroLogoIcon,
        options: [
          { value: 'sync-xero', label: 'Sync Existing' },
          { value: 'import-new', label: 'Import New' },
          { value: 'disconnect', label: 'Disconnect', className: 'text-red-500' }
        ]
      }
    },
    token_swapped: {
      title: 'Connected to Xero',
      subTitle: 'Please proceed to import your accounts',
      ctaLabel: 'Import Chart of Accounts',
      isCtaDisabled: false,
      icon: XeroLogoIcon,
      dropdown: {
        label: 'Update',
        icon: XeroLogoIcon,
        options: [
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon, disabled: true },
          { value: 'import-new', label: 'Import Xero COA', icon: XeroLogoIcon }
        ]
      }
    },

    requested: {
      title: 'Your Chart of Accounts are loading...',
      subTitle: 'Your COAs will appear once your request to connect with Xero has been processed',
      ctaLabel: 'Requested',
      isCtaDisabled: true,
      dropdown: {
        label: 'Add New',
        icon: AddIcon,
        options: [
          { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
        ]
      }
    },

    approved: {
      title: 'Xero Request Approved!',
      subTitle: 'Continue to connect to Xero, to import your accounts',
      ctaLabel: 'Connect Xero',
      ctaIcon: XeroLogoIcon,
      isCtaDisabled: false,
      icon: SuccessIcon,
      dropdown: {
        label: 'Add New',
        icon: AddIcon,
        options: [
          { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
        ]
      }
    },

    default: {
      title: 'Please import or create your Chart of Accounts',
      subTitle: 'You can sync with Xero or add new COAs manually',
      ctaLabel: 'Request Xero Connection',
      isCtaDisabled: false,
      ctaIcon: XeroLogoIcon,
      status: '',
      icon: null,
      dropdown: {
        label: 'Add New',
        icon: AddIcon,
        options: [
          { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
        ]
      }
    }
  },
  quickbooks: {
    completed: {
      title: 'Connected to QuickBooks',
      subTitle: 'Please proceed to import your accounts',
      ctaLabel: 'Import Chart of Accounts',
      isCtaDisabled: false,
      icon: QuickBooksIcon,
      dropdown: {
        label: 'Update',
        icon: QuickBooksIcon,
        options: [
          { value: 'sync-xero', label: 'Sync Existing' },
          { value: 'import-new', label: 'Import New' },
          { value: 'disconnect', label: 'Disconnect', className: 'text-red-500' }
        ]
      }
    },
    token_swapped: {
      title: 'Connected to QuickBooks',
      subTitle: 'Please proceed to import your accounts',
      ctaLabel: 'Import Chart of Accounts',
      isCtaDisabled: false,
      icon: QuickBooksIcon,
      dropdown: {
        label: 'Update',
        icon: QuickBooksIcon,
        options: [
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon, disabled: true },
          { value: 'import-new', label: 'Import QuickBooks COA', icon: QuickBooksIcon }
        ]
      }
    },

    requested: {
      title: 'Your Chart of Accounts are loading...',
      subTitle: 'Your COAs will appear once your request to connect with QuickBooks has been processed',
      ctaLabel: 'Requested',
      isCtaDisabled: true,
      dropdown: {
        label: 'Add New',
        icon: AddIcon,
        options: [
          { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
        ]
      }
    },

    approved: {
      title: 'QuickBooks Request Approved!',
      subTitle: 'Continue to connect to QuickBooks, to import your accounts',
      ctaLabel: 'Connect QuickBooks',
      ctaIcon: QuickBooksIcon,
      isCtaDisabled: false,
      icon: SuccessIcon,
      dropdown: {
        label: 'Add New',
        icon: AddIcon,
        options: [
          { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
        ]
      }
    },

    default: {
      title: 'Please import or create your Chart of Accounts',
      subTitle: 'You can sync with QuickBooks or add new COAs manually',
      ctaLabel: 'Request QuickBooks Connection',
      isCtaDisabled: false,
      ctaIcon: QuickBooksIcon,
      status: '',
      icon: null,
      dropdown: {
        label: 'Add New',
        icon: AddIcon,
        options: [
          { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
          { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
        ]
      }
    }
  },
  default: {
    title: 'Please import or create your Chart of Accounts',
    subTitle: 'You can sync with Xero or add new COAs manually',
    ctaLabel: 'Request Xero Connection',
    isCtaDisabled: false,
    ctaIcon: XeroLogoIcon,
    status: '',
    icon: null,
    dropdown: {
      label: 'Add New',
      icon: AddIcon,
      options: [
        { value: 'create-coa', label: 'Create account', icon: BlackAddIcon },
        { value: 'import-csv', label: 'Import .CSV', icon: CsvIcon }
      ]
    }
  }
}

export const ACTION_DROPDOWN = [
  {
    value: 'edit-coa',
    label: 'Edit',
    className: 'text-xs leading-4 font-normal text-dashboard-main py-[6px] w-[120px]'
  },
  { value: 'delete-coa', label: 'Delete', className: 'text-xs leading-4 font-normal text-error-500 py-[6px] w-[120px]' }
]

export const COA_TABLE_HEADERS = [
  {
    Header: 'Code',
    accessor: 'code'
  },
  {
    Header: 'Name',
    accessor: 'name'
  },
  {
    Header: 'Type',
    accessor: 'type'
  },
  {
    Header: 'Description',
    accessor: 'description'
  },
  {
    Header: '',
    accessor: 'action'
  }
]
