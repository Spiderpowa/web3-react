import { Provider } from '../manager';
import { ConnectorArguments } from './connector';
declare const InjectedDEXONConnector_base: any;
export default class InjectedDEXONConnector extends InjectedDEXONConnector_base {
    private runOnDeactivation;
    constructor(args?: ConnectorArguments);
    onActivation(): Promise<void>;
    getProvider(): Promise<Provider>;
    getAccount(provider: Provider): Promise<string>;
    onDeactivation(): void;
    private networkChangedHandler;
    private accountsChangedHandler;
}
export {};
