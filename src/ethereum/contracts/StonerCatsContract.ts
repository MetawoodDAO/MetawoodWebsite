import {BigNumber, ethers} from "ethers";
import {asERC721, ERC721ABI, ERC721Contract, ERC721Token, TokenAttributes} from "./base/ERC721";

type StonerCatTraits = "Name"|"Eyes"|"Left Arm"|"Right Arm"|"Expressions"|"Collars"|"Backdrops"|"Accessories";

export interface StonerCat {
    name: string;
    image: string;
    attributes: TokenAttributes<StonerCatTraits>[];
}

const STONER_CATS_ADDRESS = "0xD4d871419714B778eBec2E22C7c53572b573706e";
const STONER_CATS_ABI = [
    "function tokensOfOwner(address _owner) external view returns(uint256[] memory)", // Unnecessary, thanks to helper function in ERC721
];

export class StonerCatsContract {
    private readonly contract: ethers.Contract;
    public readonly ERC721: ERC721Contract<StonerCat>;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(STONER_CATS_ADDRESS, ERC721ABI(STONER_CATS_ABI), provider);
        this.ERC721 = asERC721(this.contract);
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
    cat: ERC721Token<StonerCat>;
    poster: StonerCatPoster;
}
