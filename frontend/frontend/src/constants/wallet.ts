import { AbstractConnector } from '@web3-react/abstract-connector'
import METAMASK_ICON_URL from '../../public/image/Metamask.png'
import TREZOR_ICON_URL from '../../public/image/Trezor.png'
import LEDGER_ICON_URL from '../../public/image/Ledger.png'
import LATTICE_ICON_URL from '../../public/image/Lattice.png'
import COINBASE_ICON_URL from '../../public/image/Coinbase.png'
import STATUS_ICON_URL from '../../public/image/Status.png'
import WALLETCONNECT_ICON_URL from '../../public/image/WalletConnect.png'
import TORUS_ICON_URL from '../../public/image/Torus.png'
import FORTMATIC_ICON_URL from '../../public/image/Fortmatic.png'

interface WalletInfo {
  connector: string
  name: string
  iconURL: any
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    connector: 'injected',
    name: 'MetaMask',
    iconURL: METAMASK_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  TREZOR: {
    connector: 'injected',
    name: 'Trezor',
    iconURL: TREZOR_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  LEDGER: {
    connector: 'injected',
    name: 'Ledger',
    iconURL: LEDGER_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  LATTICE: {
    connector: 'injected',
    name: 'Lattice',
    iconURL: LATTICE_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLETCONNECT: {
    connector: 'walletconnect',
    name: 'WalletConnect',
    iconURL: WALLETCONNECT_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  COINBASE: {
    connector: 'injected',
    name: 'Coinbase',
    iconURL: COINBASE_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  FORTMATIC: {
    connector: 'injected',
    name: 'Fortmatic',
    iconURL: FORTMATIC_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  STATUS: {
    connector: 'injected',
    name: 'Status',
    iconURL: STATUS_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  TORUS: {
    connector: 'injected',
    name: 'Torus',
    iconURL: TORUS_ICON_URL,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  }
}
