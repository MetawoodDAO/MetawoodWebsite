import {ethers, Signer} from "ethers";
import {isError} from "../utils/Utils";

export type AccountsChangedHandler = (accounts: Array<string>) => void | Promise<void>;
export type ChainChangedHandler = (newChainId: number) => void | Promise<void>;
export type AttachResult = {success: true} | {success: false, message: string};

export interface ProviderBundle {
    provider: ethers.providers.Web3Provider;
    signer: Signer;
    address: string;
}

export class Web3Controller {
    private accountsChangedHandlers: AccountsChangedHandler[] = [];
    private chainChangedHandlers: ChainChangedHandler[] = [];

    readonly accountsChanged = (accounts: Array<string>) => {
        Promise.all(this.accountsChangedHandlers.map(async (handler) => {
            await handler(accounts);
        }));
    }

    readonly chainChanged = (chainIdHex: string) => {
        const newChainId = ethers.BigNumber.from(chainIdHex).toNumber();
        Promise.all(this.chainChangedHandlers.map(async (handler) => {
            await handler(newChainId);
        }));
    }

    readonly ethMessage = (...args: any) => {
        console.log('ETH MESSAGE');
        console.log(args);
    }

    readonly connected = (args: {chainId: string}[]) => {
        console.log('Web3 CONNECTED');
    }

    readonly disconnected = (args: {chainId: string}[]) => {
        console.log('DISCONNECTED');
        console.log(args);
    }

    attach(): AttachResult {
        const ethereum = getEthereum();
        if (!ethereum) {
            return {success: false, message: "Web3 not injected. Is MetaMask installed?"};
        }

        ethereum.on('accountsChanged', this.accountsChanged);
        ethereum.on('chainChanged', this.chainChanged);
        ethereum.on('message', this.ethMessage);
        ethereum.on('connect', this.connected);
        ethereum.on('disconnect', this.disconnected);

        return {success: true};
    }

    detatch() {
        const ethereum = getEthereum();
        if (!ethereum) {
            return;
        }

        ethereum.removeListener('accountsChanged', this.accountsChanged);
        ethereum.removeListener('chainChanged', this.chainChanged);
        ethereum.removeListener('message', this.ethMessage);
        ethereum.removeListener('connect', this.connected);
        ethereum.removeListener('disconnect', this.disconnected);
    }

    public addAccountsChangedHandler(handler: AccountsChangedHandler) {
        this.accountsChangedHandlers.push(handler);
    }

    public addChainChangedHandler(handler: ChainChangedHandler) {
        this.chainChangedHandlers.push(handler);
    }

    //
    //
    //

    public async getProvider(): Promise<ProviderBundle> {
        const ethereum = getEthereum();

        // @ts-ignore
        if (!ethereum) {
            throw new Error("No crypto wallet found");
        }

        try {
            await ethereum.request({method: 'eth_requestAccounts'});
        } catch (err: any) {
            const metamaskError = err as {message: string, code: number, data?: unknown};
            throw new Error(metamaskError.message);
        }

        //const {chainId, networkVersion, isMetaMask} = ethereum;
        //console.log(`[WINDOW] chainId: ${chainId} - networkVersion: ${networkVersion} - isMetaMask: ${isMetaMask}`);

        const provider = new ethers.providers.Web3Provider(ethereum);

        const network = await provider.detectNetwork();
        // console.log(`[PROVIDER] chainId: ${network.chainId} - name: ${network.name} - ensAddress: ${network.ensAddress}`);
        if (network.chainId !== 1) {
            throw new Error(`Must be on mainnet. Current network id: ${network.chainId}`);
        }


        const signer = provider.getSigner();
        try {
            const address = await signer.getAddress();
            if (!address) {
                throw new Error("No address found for Signer");
            }
        } catch (err: any) {
            if (isError(err)) {
                console.error(err.message);
            }
            throw new Error("Unable to load address for signer");
        }

        return {
            provider,
            signer,
            address: await signer.getAddress()
        };
    }
}

export type EthereumEventType = 'accountsChanged' | 'chainChanged' | 'message' | 'connect' | 'disconnect';
export interface InjectedEthereum {
    isMetaMask: boolean;
    isConnected: ()=>boolean;
    request: (args:{method:string, params?: unknown[]|object})=>Promise<unknown>;
    on: (event: EthereumEventType, handler: (args?: any)=>void)=>void;
    removeListener: (event: EthereumEventType, handler: (args?: any)=>void)=>void;
}

function getEthereum(): InjectedEthereum | undefined {
    // @ts-ignore
    const {ethereum} = window;
    if (!ethereum) {
        return undefined;
    }
    return ethereum as InjectedEthereum;
}
