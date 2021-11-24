import {BigNumber, ethers} from 'ethers';
import Safe, { EthersAdapter } from '@gnosis.pm/safe-core-sdk';
import { Address } from "../Web3Types";

// DOCUMENTATION
// https://www.npmjs.com/package/@gnosis.pm/safe-core-sdk

export const GNOSIS_SAFE_ADDRESS = '0x1715f37113C56d7361b1191AEE2B45DA020a85E9';

export class GnosisController {

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
