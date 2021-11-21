import {BigNumber, ethers} from "ethers";
import {ProviderBundle} from "../Web3Controller";

const STONER_CATS_ADDRESS = "0xD4d871419714B778eBec2E22C7c53572b573706e";
const STONER_CATS_ABI = [
    "function tokensOfOwner(address _owner) external view returns(uint256[] memory)",
    "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)"
];
export const STONER_CATS_CONTRACT = new ethers.Contract(STONER_CATS_ADDRESS, STONER_CATS_ABI);

export class StonerCatsContract {
    private readonly providerBundle;
    private readonly contract;

    constructor(providerBundle: ProviderBundle) {
        this.providerBundle = providerBundle;
        this.contract = STONER_CATS_CONTRACT.connect(providerBundle.provider);
    }

    async tokensOfProvider(): Promise<BigNumber[]> {
        return await this.tokensOfOwner(this.providerBundle.address);
    }

    async tokensOfOwner(ownerAddress: string): Promise<BigNumber[]> {
        const result = await this.contract.tokensOfOwner(ownerAddress);
        return result as BigNumber[];
    }

    async tokenURI(tokenId: BigNumber): Promise<string> {
        const result = await this.contract.tokenURI(tokenId);
        return result as string;
    }
}

const STONER_CATS_POSTER_ADDRESS = "0xA58723E04Af0e1c38213036b321e1243F8E16336";
const STONER_CATS_POSTER_ABI = [
    "function claimable(uint _tokenId) public view returns(bool)"
];
export const STONER_CATS_POSTER_CONTRACT = new ethers.Contract(STONER_CATS_POSTER_ADDRESS, STONER_CATS_POSTER_ABI);

export class StonerCatsPosterContract {
    private readonly providerBundle;
    private readonly contract;

    constructor (providerBundle: ProviderBundle) {
        this.providerBundle = providerBundle;
        this.contract = STONER_CATS_POSTER_CONTRACT.connect(providerBundle.provider);
    }

    async claimable(tokenId: BigNumber): Promise<boolean> {
        return await this.contract.claimable(tokenId);
    }
}
