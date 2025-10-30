/* eslint-disable prefer-regex-literals */
import { AbstractConnector } from '@web3-react/abstract-connector'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { ConnectorUpdate } from '@web3-react/types'

declare type ArrayOneOrMore<T> = {
  0: T
} & Array<T>

interface ICustomWalletConnectConnector {
  supportedChainIds: ArrayOneOrMore<number>
  rpcMap: { [chainId: number]: string }
}

export class CustomWalletConnectConnector extends AbstractConnector {
  //   private static readonly configuration = getConfiguration()['wallet-connect']

  private provider?: typeof EthereumProvider.prototype

  supportedChainIds: ArrayOneOrMore<number>

  rpcMap: { [chainId: number]: string }

  constructor(config: ICustomWalletConnectConnector) {
    super({
      supportedChainIds: config.supportedChainIds
    })
    this.supportedChainIds = config.supportedChainIds
    this.rpcMap = config.rpcMap
  }

  activate = async (chainId?: number): Promise<ConnectorUpdate<string | number>> => {
    // https://docs.walletconnect.com/advanced/providers/ethereum
    const provider = await EthereumProvider.init({
      projectId: '3612a65e438ee547fbcdcb70f09f61fb', // REQUIRED your projectId
      showQrModal: true, // REQUIRED set to "true" to use @walletconnect/modal
      optionalChains: this.supportedChainIds // chains - required for optional namespaces

      // rpcMap, // OPTIONAL rpc urls for each chain
      // qrModalOptions // OPTIONAL - `undefined` by default, see https://docs.walletconnect.com/web3modal/options
    })

    const accounts = await provider.enable()

    provider.on('accountsChanged', this.handleAccountsChanged)
    provider.on('chainChanged', this.handleChainChanged)
    provider.on('disconnect', this.handleDisconnect)

    this.provider = provider

    return {
      chainId: provider.chainId,
      account: accounts[0],
      provider
    }
  }

  static clearStorage = (storage: Storage) => {
    storage.removeRegExp(new RegExp('^wc@2:'))
  }

  getProvider = async (): Promise<any> => {
    if (!this.provider) {
      throw new Error('Provider is undefined')
    }

    return this.provider
  }

  getChainId = async (): Promise<string | number> => {
    if (!this.provider) {
      throw new Error('Provider is undefined')
    }

    return this.provider.chainId
  }

  getAccount = async (): Promise<string | null> => {
    if (!this.provider) {
      throw new Error('Provider is undefined')
    }

    return this.provider.accounts[0]
  }

  getWalletName = (): string | undefined => this.provider?.session?.peer.metadata.name

  deactivate = (): void => {
    if (!this.provider) {
      return
    }

    this.emitDeactivate()

    this.provider
      .removeListener('accountsChanged', this.handleAccountsChanged)
      .removeListener('chainChanged', this.handleChainChanged)
      .removeListener('disconnect', this.handleDisconnect)
      .disconnect()
  }

  handleAccountsChanged = (accounts: string[]): void => {
    this.emitUpdate({ account: accounts[0] })
  }

  handleChainChanged = (chainId: string | number): void => {
    this.emitUpdate({ chainId })
  }

  handleDisconnect = (): void => {
    if (!this.provider) {
      throw new Error('Provider is undefined')
    }

    this.deactivate()
  }
}
