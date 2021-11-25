import {BigNumber, ethers} from "ethers";
import {Dispatch} from "@reduxjs/toolkit";
import {isWeb3Failure, ProviderBundle} from "./Web3Types";
import {updateStonerCatData} from "./contracts/StonerCatsContract";
import {loadGnosisData} from "./gnosis/GnosisController";
import {updateWeb3State} from "../redux/Web3Slice";

export type AccountsChangedHandler = (accounts: Array<string>) => void | Promise<void>;
export type ChainChangedHandler = (newChainId: number) => void | Promise<void>;

const LISTENERS: ((bundle: ProviderBundle, dispatch: Dispatch)=>void)[] = [
    updateStonerCatData,
    loadGnosisData,
];

export class Web3Controller {
    private readonly ethereum = getEthereum();
    private readonly dispatch;

    constructor(dispatch: Dispatch) {
        this.dispatch = dispatch;
        this.attach();
    }

    public showMetamaskAccountPopup() {
        const ethereum = this.ethereum;
        if (ethereum) {
            return ethereum.request({method: 'eth_requestAccounts'});
        }
    }

    //
    // Public methods
    //

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

        // First check that there's even an injected 'ethereum' global

        const ethereum = this.ethereum;
        if (!ethereum) {
            this.notifyListeners({reason: "NOT_INSTALLED"});
            //this.dispatch(updateProvider({reason: "NOT_INSTALLED"}));
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
                    this.notifyListeners({reason: "PENDING_NETWORK_SWITCH"});
                    //this.dispatch(updateProvider({reason: "PENDING_NETWORK_SWITCH"}));
                    return;
                } catch (err) {
                    // User denied the switch.
                    // Fall through to NOT_MAINNET
                }
            }
            this.notifyListeners({reason: "NOT_MAINNET", chainId});
            //this.dispatch(updateProvider({ reason: "NOT_MAINNET", chainId }));
            return;
        }

        // Then see if there are any connected Accounts, and prompt if user-initiated

        const availableAccounts = await provider.listAccounts();

        if (availableAccounts.length === 0) {
            if (showMetamaskPopup) {
                try {
                    // Show the Metamask Popup
                    await ethereum.request({method: 'eth_requestAccounts'});

                    this.notifyListeners({reason: "PENDING_CONNECTION"});
                    //this.dispatch(updateProvider({reason: "PENDING_CONNECTION"}));
                    return;
                } catch (err) {
                    // User clicked "Cancel" on Metamask popup
                    // Fall through to NOT_CONNECTED
                }
            }
            this.notifyListeners({reason: "NOT_CONNECTED"});
            //this.dispatch(updateProvider({reason: "NOT_CONNECTED"}));
            return;
        }

        const address = await provider.getSigner().getAddress();

        this.notifyListeners({
            provider,
            address,
        });
        //this.dispatch(updateProvider({
        //    provider,
        //    address,
        //}));
    }

    private notifyListeners(bundle: ProviderBundle) {
        if (isWeb3Failure(bundle)) {
            this.dispatch(updateWeb3State({connected: false, reason: bundle}));
        } else {
            this.dispatch(updateWeb3State({connected: true, address: bundle.address}));
        }
        LISTENERS.forEach((listener) => {
            listener(bundle, this.dispatch);
        });
    }

    //
    // Event callbacks
    //

    public attach() {
        const ethereum = this.ethereum;
        if (!ethereum) {
            return;
        }

        ethereum.on('accountsChanged', this.accountsChanged);
        ethereum.on('chainChanged', this.chainChanged);
        ethereum.on('message', this.ethMessage);
        ethereum.on('connect', this.connected);
        ethereum.on('disconnect', this.disconnected);
    }

    private readonly accountsChanged = async (accounts: Array<string>) => {
        await this.updateProvider(false, false);
    }

    private readonly chainChanged = async (chainIdHex: string) => {
        await this.updateProvider(false, false);
    }

    private readonly ethMessage = (...args: any) => {
        console.log('-- ETH MESSAGE --');
        console.log(args);
    }

    private readonly connected = async (args: {chainId: string}) => {
        console.log("Connected.");
        await this.updateProvider(false, false);
    }

    private readonly disconnected = async (args: {chainId: string}[]) => {
        console.log('-- DISCONNECTED --');
        console.log(args);
        await this.updateProvider(false, false);
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
