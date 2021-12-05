import {BigNumber, ethers} from 'ethers';
import Safe, { EthersAdapter } from '@gnosis.pm/safe-core-sdk';
import {Address, isWeb3Failure, ProviderBundle} from "../Web3Types";
import {Dispatch} from "@reduxjs/toolkit";
import {ERC721Token} from "../contracts/base/ERC721";
import {OniRoninContract} from "../contracts/OniRoninContract";
import {setGnosisData} from "../../redux/GnosisSlice";
import {isError} from "../../utils/Utils";
import {OniRonin} from "../contracts/ContractTypes";

// DOCUMENTATION
// https://www.npmjs.com/package/@gnosis.pm/safe-core-sdk

const GNOSIS_SAFE_ADDRESS = '0x1715f37113C56d7361b1191AEE2B45DA020a85E9';

class GnosisController {

    static with(provider: ethers.providers.Web3Provider): GnosisController {
        return new GnosisController(provider);
    }

    private readonly provider;
    private _gnosisAdapter?: EthersAdapter = undefined;

    private constructor(provider: ethers.providers.Web3Provider) {
        this.provider = provider;
    }

    private async getSafe(): Promise<Safe> {
        if (this._gnosisAdapter === undefined) {
            const signer = this.provider.getSigner();
            this._gnosisAdapter = new EthersAdapter({
                ethers,
                signer,
            });
        }
        return await Safe.create({ethAdapter: this._gnosisAdapter, safeAddress: GNOSIS_SAFE_ADDRESS});
    }

    public async getSafeValue(): Promise<BigNumber> {
        const safe = await this.getSafe();
        return await safe.getBalance();
    }

    public async getOwnerAddresses(): Promise<Address[]> {
        const safe = await this.getSafe();
        return await safe.getOwners();
    }

    public async getModules(): Promise<string[]> {
        const safe = await this.getSafe();
        return await safe.getModules();
    }

    public async isOwner(address: string): Promise<boolean> {
        const safe = await this.getSafe();
        return await safe.isOwner(address);
    }
}

export async function loadGnosisData(bundle: ProviderBundle, dispatch: Dispatch) {
    if (isWeb3Failure(bundle)) {
        dispatch(setGnosisData({state: "Error", message: bundle.reason}));
        return;
    }

    dispatch(setGnosisData({state: "Loading"}));

    const {provider} = bundle;

    const gnosisController = GnosisController.with(provider);
    try {
        const balance = await gnosisController.getSafeValue();
        const owners = await gnosisController.getOwnerAddresses();

        let tokenIds: BigNumber[] = [];
        let uriData: ERC721Token<OniRonin>[] = []
        try {
            const oniRoninContract = new OniRoninContract(provider);
            tokenIds = await oniRoninContract.ERC721.getAllTokenIdsOwnedByAddress(GNOSIS_SAFE_ADDRESS);

            uriData = await Promise.all(tokenIds.map(async (tokenId) => {
                return await oniRoninContract.ERC721.fullyResolveURI(tokenId);
            }));
        } catch (err) {
            console.error(err);
        }

        dispatch(setGnosisData({
            state: "Loaded",
            gnosisData: {
                balance: balance.toString(),
                owners,
                oniTokenIds: tokenIds,
                oniTokens: uriData,
            }
        }));
    } catch (err) {
        console.error(err);
        if (isError(err)) {
            dispatch(setGnosisData({state: "Error", message: err.message}));
        } else {
            dispatch(setGnosisData({state: "Error", message: "Unknown error"}));
        }
    }
}
