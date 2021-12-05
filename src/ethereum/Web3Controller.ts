import {BigNumber, ethers} from "ethers";
import {Dispatch} from "@reduxjs/toolkit";
import {isWeb3Failure, ProviderBundle} from "./Web3Types";
import {updateStonerCatData} from "./contracts/StonerCatsContract";
import {loadGnosisData} from "./gnosis/GnosisController";
import {updateWeb3State} from "../redux/Web3Slice";
import {isError} from "../utils/Utils";
import {Context, createContext} from "react";

// Must be exported from this file to prevent circular dependencies
type Web3ControllerContext = Context<Web3Controller>;
// Give undefined as the default value because it will always be overridden
export const Web3ControllerReactContext: Web3ControllerContext = createContext(undefined as unknown as Web3Controller);

const LISTENERS: ((bundle: ProviderBundle, dispatch: Dispatch)=>void)[] = [
    updateStonerCatData,
    loadGnosisData,
];

export class Web3Controller {
    private readonly ethereum = getEthereum();

    constructor(private readonly dispatch: Dispatch) {
        this.attach();
    }

    public showMetamaskAccountPopup() {
        return this.updateProvider(true, true);
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

    private async updateProvider(showMetamaskPopup: boolean, askToSwitchNetworks: boolean): Promise<void> {

        // First check that there's even an injected 'ethereum' global

        const ethereum = this.ethereum;
        if (!ethereum) {
            this.notifyListeners({reason: "NOT_INSTALLED"});
            return;
        }

        // Build a provider object - much easier to interact with

        const provider = new ethers.providers.Web3Provider(ethereum);

        // Then ensure we're on Mainnet

        const network = await provider.getNetwork();
        const chainId = network.chainId;

        if (chainId !== 1) {
            let message;
            if (askToSwitchNetworks) {
                try {
                    await this.switchWalletChain(ethereum, "0x1");
                    this.notifyListeners({reason: "PENDING_NETWORK_SWITCH"});
                    // We need to wait for the user to interact with Metamask
                    return;
                } catch (err: any) {
                    // User denied the switch.
                    // Fall through to NOT_MAINNET
                    message = err.message;
                }
            }
            this.notifyListeners({reason: "NOT_MAINNET", chainId}, message);
            return;
        }

        // Then see if there are any connected Accounts, and prompt if user-initiated

        const availableAccounts = await provider.listAccounts();

        if (availableAccounts.length === 0) {
            let message;
            if (showMetamaskPopup) {
                try {
                    // Show the Metamask Popup
                    await ethereum.request({method: 'eth_requestAccounts'});

                    this.notifyListeners({reason: "PENDING_CONNECTION"});
                    // We need to wait for the user to interact with Metamask
                    return;
                } catch (err: any) {
                    // User clicked "Cancel" on Metamask popup
                    // Fall through to NOT_CONNECTED
                    message = err.message;
                }
            }
            this.notifyListeners({reason: "NOT_CONNECTED"}, message);
            return;
        }

        const address = await provider.getSigner().getAddress();

        this.notifyListeners({
            provider,
            address,
        });
    }

    private notifyListeners(bundle: ProviderBundle, message?: string) {
        if (isWeb3Failure(bundle)) {
            this.dispatch(updateWeb3State({connected: false, reason: bundle, message}));
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
            this.dispatch(updateWeb3State({connected: false, reason: {reason: "NOT_INSTALLED"}, message: "Could not find injected ethereum object"}));
            return;
        }

        ethereum.on('accountsChanged', this.accountsChanged);
        ethereum.on('chainChanged', this.chainChanged);
        ethereum.on('message', this.ethMessage);
        ethereum.on('connect', this.connected);
        ethereum.on('disconnect', this.disconnected);

        this.dispatch(updateWeb3State({connected: false, reason: {reason: "NOT_CONNECTED"}, message: "Please connect Metamask"}));

        this.updateProvider(false, false).catch(err => {
            if (isError(err)) {
                this.dispatch(updateWeb3State({connected: false, reason: {reason: "NOT_CONNECTED"}, message: err.message}));
            }
            console.error(err);
        });
    }

    private readonly accountsChanged = async (accounts: Array<string>) => {
        await this.updateProvider(false, false);
    }

    private readonly chainChanged = async (chainIdHex: string) => {
        // We want to show the accounts popup
        await this.updateProvider(true, false);
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
