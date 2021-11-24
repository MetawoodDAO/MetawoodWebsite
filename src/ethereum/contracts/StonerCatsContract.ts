import {BigNumber, ethers, providers} from "ethers";
import {Address} from "../Web3Types";
import {asERC721, ERC721ABI, ERC721Contract} from "./base/ERC721";

export interface StonerCatAttributes {
    trait_type: "Name"|"Eyes"|"Left Arm"|"Right Arm"|"Expressions"|"Collars"|"Backdrops"|"Accessories",
    value: string
}

export interface StonerCat {
    tokenId: BigNumber;
    catData: {
        name: string;
        image: string;
        attributes: StonerCatAttributes[];
    }
}

const STONER_CATS_ADDRESS = "0xD4d871419714B778eBec2E22C7c53572b573706e";
const STONER_CATS_ABI = ERC721ABI([
    "function tokensOfOwner(address _owner) external view returns(uint256[] memory)",
]);

export class StonerCatsContract {
    private readonly contract: ethers.Contract;
    public readonly ERC721: ERC721Contract;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(STONER_CATS_ADDRESS, STONER_CATS_ABI, provider);
        this.ERC721 = asERC721(this.contract);
    }

    async getTokenIdsOfCurrentProvider(): Promise<BigNumber[]> {
        return await this.tokensOfOwner(await (this.contract.provider as providers.Web3Provider).getSigner().getAddress());
    }

    async tokensOfOwner(ownerAddress: Address): Promise<BigNumber[]> {
        const result = await this.contract.tokensOfOwner(ownerAddress);
        return result as BigNumber[];
    }

    async getStonerCats(address: Address): Promise<StonerCat[]> {
        const tokenIds = await this.tokensOfOwner(address);
        const erc721 = asERC721(this.contract);
        return await Promise.all(tokenIds.map(async (tokenId) => {
            const data = await erc721.fullyResolveURI(tokenId);
            return {
                tokenId,
                catData: data
            };
        }));
    }

    async getStonerCatsOfCurrentProvider(): Promise<StonerCat[]> {
        return await this.getStonerCats(await (this.contract.provider as providers.Web3Provider).getSigner().getAddress());
    }
}

const STONER_CATS_POSTER_ADDRESS = "0xA58723E04Af0e1c38213036b321e1243F8E16336";
const STONER_CATS_POSTER_ABI = [
    "function claimable(uint _tokenId) public view returns(bool)"
];

export interface StonerCatPoster {
    claimable: boolean;
}

export class StonerCatsPosterContract {
    private readonly contract;
    private readonly ERC721;

    constructor (provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(STONER_CATS_POSTER_ADDRESS, ERC721ABI(STONER_CATS_POSTER_ABI), provider);
        this.ERC721 = asERC721(this.contract);
    }

    async claimable(tokenId: BigNumber): Promise<boolean> {
        return await this.contract.claimable(tokenId);
    }
}

export interface StonerCatAndPoster {
    cat: StonerCat;
    poster: StonerCatPoster;
}
