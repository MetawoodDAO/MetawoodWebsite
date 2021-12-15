import {BigNumber, ethers} from "ethers";
import {asERC721, ERC721ABI, ERC721Contract, ERC721EnumerableABI, ERC721MetadataABI} from "./base/ERC721";
import {isWeb3Failure, ProviderBundle} from "../Web3Types";
import {Dispatch} from "@reduxjs/toolkit";
import {setCats} from "../../redux/StonerCatsSlice";
import {StonerCat} from "./ContractTypes";

const STONER_CATS_ADDRESS = "0xD4d871419714B778eBec2E22C7c53572b573706e";
const STONER_CATS_ABI = [
    "function tokensOfOwner(address _owner) external view returns(uint256[] memory)", // Unnecessary, thanks to helper function in ERC721
];

class StonerCatsContract {
    private readonly contract: ethers.Contract;
    public readonly ERC721: ERC721Contract<StonerCat>;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(STONER_CATS_ADDRESS, ERC721ABI(ERC721EnumerableABI(ERC721MetadataABI(STONER_CATS_ABI))), provider);
        this.ERC721 = asERC721(this.contract);
    }
}

//
//
//

const STONER_CATS_POSTER_ADDRESS = "0xA58723E04Af0e1c38213036b321e1243F8E16336";
const STONER_CATS_POSTER_ABI = [
    "function claimable(uint _tokenId) public view returns(bool)"
];

class StonerCatsPosterContract {
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

//
//
//

export async function updateStonerCatData(providerBundle: ProviderBundle, dispatch: Dispatch) {
    if (isWeb3Failure(providerBundle)) {
        return;
    }

    const {provider, address} = providerBundle;

    try {
        const stonerCatsContract = new StonerCatsContract(provider);
        const stonerCatsPosterContract = new StonerCatsPosterContract(provider);

        const catTokens = await stonerCatsContract.ERC721.getAllFullyResolvedTokensOwnedByAddress(address);

        const catsAndPosters = await Promise.all(catTokens.map(async cat => {
            const claimable = await stonerCatsPosterContract.claimable(cat.tokenId);
            return {
                cat,
                poster: {
                    claimable
                }
            }
        }));

        dispatch(setCats(catsAndPosters));
    } catch (err: any) {
        console.error(err);
        dispatch(setCats(undefined));
    }
}
