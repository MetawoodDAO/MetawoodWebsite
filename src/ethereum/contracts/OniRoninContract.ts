import { BigNumber, ethers } from "ethers";
import {asERC721, ERC721ABI, ERC721Contract} from "./base/ERC721";

const ONI_RONIN_ADDRESS = "0x2127fe7ffce4380459cced92f2d4793f3af094a4";

export class OniRoninContract {
    private readonly contract;
    public readonly ERC721: ERC721Contract;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(ONI_RONIN_ADDRESS, ERC721ABI(), provider);
        this.ERC721 = asERC721(this.contract);
    }

    async getTokensOfAddress(address: string): Promise<BigNumber[]> {
        const numberOfTokens = await this.ERC721.balanceOf(address);
        if (numberOfTokens.eq(0)) {
            return [];
        }

        const tokenIds: BigNumber[] = [];
        for (let i = 0; i < numberOfTokens.toNumber(); ++i) {
            const tokenId = await this.ERC721.tokenOfOwnerByIndex(address, i);
            tokenIds.push(tokenId);
        }

        return tokenIds;
    }
}
