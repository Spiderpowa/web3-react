declare module 'fortmatic';
declare module 'trezor-connect';
declare module '@walletconnect/web3-subprovider';
declare module 'ethereumjs-tx';
declare module 'lodash';
interface Ethereum {
    autoRefreshOnNetworkChange?: boolean;
    isMetaMask?: boolean;
    enable: () => Promise<void>;
    on?: (eventName: string, listener: Function) => void;
    removeListener?: (eventName: string, listener: Function) => void;
}
interface DEXON {
    autoRefreshOnNetworkChange?: boolean;
    isDekuSan?: boolean;
    enable: () => Promise<void>;
    on?: (eventName: string, listener: Function) => void;
    removeListener?: (eventName: string, listener: Function) => void;
}
declare interface Window {
    ethereum?: Ethereum;
    dexon?: DEXON;
    web3?: any;
}
declare interface Error {
    code?: string | number | undefined;
}
