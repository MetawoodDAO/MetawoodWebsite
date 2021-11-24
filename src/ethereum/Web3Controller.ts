import {BigNumber, ethers} from "ethers";
import {isWeb3Failure, ProviderBundle, Web3FailureReason} from "./Web3Types";

export type AccountsChangedHandler = (accounts: Array<string>) => void | Promise<void>;
export type ChainChangedHandler = (newChainId: number) => void | Promise<void>;
export type ConnectedHandler = (chainId: number) => void | Promise<void>;

export class Web3Controller {
    private readonly ethereum = getEthereum();

    private providerOrFailure: ethers.providers.Web3Provider | Web3FailureReason = {reason: "NOT_INSTALLED"};
    private signerAddress?: string;

    //
    // Public methods
    //

    public getProviderBundle(): ProviderBundle {
        return isWeb3Failure(this.providerOrFailure) ? this.providerOrFailure : {
            provider: this.providerOrFailure,
            address: this.getCurrentSignerAddress(),
        };
    }

    public getCurrentSignerAddress(): string {
        if (this.signerAddress === undefined) {
            throw new Error("Provider not set up - unable to provide address");
        }
        return this.signerAddress;
    }

    public async switchWalletChain(ethereum: InjectedEthereum, chainId: string) {
        await ethereum.request({method: 'wallet_switchEthereumChain', params: [
                { chainId }
            ]});
    }

    public async getMetaMaskMetaData(ethereum?: InjectedEthereum): Promise<object | undefined> {
        if (!ethereum) {
            return;
        }

        const request = async (method: string, params?: object) => {
            try {
                return await ethereum.request({method, ...params});
            } catch (err) {
                // const metamaskError = err as {message: string, code: number, data?: unknown};
                console.log(`MetaMask Error on method: ${method}`);
                return "--> ERROR DURING REQUEST <--";
            }
        }

        const clientVersion = await request('web3_clientVersion') as string;
        //const sha3 = await request('web3_sha3', {data: '0x68656c6c6f20776f726c64'}) as string; // This function encodes some data into sha3
        const version = await request('net_version') as string;
        const peerCount = await request('net_peerCount') as string;
        const listening = await request('net_listening') as boolean;
        const protocolVersion = await request('eth_protocolVersion') as string;
        const syncing = await request('eth_syncing') as boolean;
        const coinbase = await request('eth_coinbase') as string;
        const mining = await request('eth_mining') as string;
        const hashrate = await request('eth_hashrate') as string;
        const gasPrice = await request('eth_gasPrice') as string;
        // const accounts // done elsewhere
        // const blockNumber // available via provider
        // const balance // available via provider
        // const getStorageAt // function

        return {
            web3: {
                clientVersion,
                //sha3,
            },
            net: {
                version,
                peerCount: BigNumber.from(peerCount).toString(),
                listening,
            },
            eth: {
                protocolVersion,
                syncing,
                coinbase,
                mining,
                hashrate,
                gasPrice,
            },
        };
    }

    //
    // Setting up the Provider
    //

    public async updateProvider(showMetamaskPopup: boolean, askToSwitchNetworks: boolean): Promise<void> {
        this.signerAddress = undefined;

        // First check that there's even an injected 'ethereum' global

        const ethereum = this.ethereum;
        if (!ethereum) {
            this.providerOrFailure = {reason: "NOT_INSTALLED"};
            return;
        }

        // Then ensure we're on Mainnet

        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId;

        if (chainId !== 1) {
            if (askToSwitchNetworks) {
                try {
                    await this.switchWalletChain(ethereum, "0x1");
                    this.providerOrFailure = {reason: "PENDING_NETWORK_SWITCH"};
                    return;
                } catch (err) {
                    // User denied the switch.
                    // Fall through to NOT_MAINNET
                }
            }
            this.providerOrFailure = { reason: "NOT_MAINNET", chainId };
            return;
        }

        // Then see if there are any connected Accounts, and prompt if user-initiated

        const availableAccounts = await provider.listAccounts();

        if (availableAccounts.length === 0) {
            if (showMetamaskPopup) {
                try {
                    // Show the Metamask Popup
                    await ethereum.request({method: 'eth_requestAccounts'});

                    this.providerOrFailure = {reason: "PENDING_CONNECTION"};
                    return;
                } catch (err) {
                    // User clicked "Cancel" on Metamask popup
                    // Fall through to NOT_CONNECTED
                }
            }
            this.providerOrFailure = {reason: "NOT_CONNECTED"};
            return;
        }

        this.providerOrFailure = provider;
        this.signerAddress = await provider.getSigner().getAddress();
    }

    //
    // Event callbacks
    //

    public attach(): Web3FailureReason | undefined {
        const ethereum = this.ethereum;
        if (!ethereum) {
            return {reason: "NOT_INSTALLED"}
        }

        ethereum.on('accountsChanged', this.accountsChanged);
        ethereum.on('chainChanged', this.chainChanged);
        ethereum.on('message', this.ethMessage);
        ethereum.on('connect', this.connected);
        ethereum.on('disconnect', this.disconnected);
    }

    public detatch() {
        const ethereum = this.ethereum;
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

    public addConnectedHandler(handler: ConnectedHandler) {
        this.connectedHandlers.push(handler);
    }

    private readonly accountsChangedHandlers: AccountsChangedHandler[] = [];
    private readonly chainChangedHandlers: ChainChangedHandler[] = [];
    private readonly connectedHandlers: ConnectedHandler[] = [];

    private readonly accountsChanged = async (accounts: Array<string>) => {
        console.log("Accounts Changed");
        console.log(accounts);
        await this.updateProvider(false, false);
        Promise.all(this.accountsChangedHandlers.map(async (handler) => {
            await handler(accounts);
        }));
    }

    private readonly chainChanged = async (chainIdHex: string) => {
        await this.updateProvider(false, false);
        const newChainId = ethers.BigNumber.from(chainIdHex).toNumber();
        Promise.all(this.chainChangedHandlers.map(async (handler) => {
            await handler(newChainId);
        }));
    }

    private readonly ethMessage = (...args: any) => {
        console.log('-- ETH MESSAGE --');
        console.log(args);
    }

    private readonly connected = async (args: {chainId: string}) => {
        await this.updateProvider(false, false);
        const chainId = ethers.BigNumber.from(args.chainId).toNumber();
        Promise.all(this.connectedHandlers.map(async (handler) => {
            await handler(chainId);
        }));
    }

    private readonly disconnected = async (args: {chainId: string}[]) => {
        await this.updateProvider(false, false);
        console.log('-- DISCONNECTED --');
        console.log(args);
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
