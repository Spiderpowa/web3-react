import { Provider } from '../manager'
import Connector, { ErrorCodeMixin, ConnectorArguments } from './connector'

const InjectedConnectorErrorCodes = ['ETHEREUM_ACCESS_DENIED', 'LEGACY_PROVIDER', 'NO_WEB3', 'UNLOCK_REQUIRED']
export default class InjectedDEXONConnector extends ErrorCodeMixin(Connector, InjectedConnectorErrorCodes) {
  private runOnDeactivation: (() => void)[] = []

  public constructor(args: ConnectorArguments = {}) {
    super(args)

    this.networkChangedHandler = this.networkChangedHandler.bind(this)
    this.accountsChangedHandler = this.accountsChangedHandler.bind(this)
  }

  public async onActivation(): Promise<void> {
    const { dexon, web3 } = window

    if (dexon) {
      await dexon.enable().catch(
        (error: any): any => {
          const deniedAccessError: Error = Error(error)
          deniedAccessError.code = InjectedDEXONConnector.errorCodes.ETHEREUM_ACCESS_DENIED
          throw deniedAccessError
        }
      )

      // initialize event listeners
      if (dexon.on) {
        dexon.on('networkChanged', this.networkChangedHandler)
        dexon.on('accountsChanged', this.accountsChangedHandler)

        this.runOnDeactivation.push(
          (): void => {
            if (dexon.removeListener) {
              dexon.removeListener('networkChanged', this.networkChangedHandler)
              dexon.removeListener('accountsChanged', this.accountsChangedHandler)
            }
          }
        )
      }

      if (dexon.isDekuSan) {
        dexon.autoRefreshOnNetworkChange = false
      }
    } else if (web3) {
      const legacyError: Error = Error('Your web3 provider is outdated, please upgrade to a modern provider.')
      legacyError.code = InjectedDEXONConnector.errorCodes.LEGACY_PROVIDER
      throw legacyError
    } else {
      const noWeb3Error: Error = Error('Your browser is not equipped with web3 capabilities.')
      noWeb3Error.code = InjectedDEXONConnector.errorCodes.NO_WEB3
      throw noWeb3Error
    }
  }

  public async getProvider(): Promise<Provider> {
    const { dexon } = window
    return dexon
  }

  public async getAccount(provider: Provider): Promise<string> {
    const account = super.getAccount(provider)

    if (account === null) {
      const unlockRequiredError: Error = Error('DEXON account locked.')
      unlockRequiredError.code = InjectedDEXONConnector.errorCodes.UNLOCK_REQUIRED
      throw unlockRequiredError
    }

    return account
  }

  public onDeactivation(): void {
    this.runOnDeactivation.forEach((runner): void => runner())
    this.runOnDeactivation = []
  }

  // event handlers
  private networkChangedHandler(networkId: string | number): void {
    const networkIdNumber = Number(networkId)

    try {
      super._validateNetworkId(networkIdNumber)

      super._web3ReactUpdateHandler({
        updateNetworkId: true,
        networkId: networkIdNumber
      })
    } catch (error) {
      super._web3ReactErrorHandler(error)
    }
  }

  private accountsChangedHandler(accounts: string[]): void {
    if (!accounts[0]) {
      const unlockRequiredError: Error = Error('Ethereum account locked.')
      unlockRequiredError.code = InjectedDEXONConnector.errorCodes.UNLOCK_REQUIRED
      super._web3ReactErrorHandler(unlockRequiredError)
    } else {
      super._web3ReactUpdateHandler({
        updateAccount: true,
        account: accounts[0]
      })
    }
  }
}
