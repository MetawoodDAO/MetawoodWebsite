import {ethers} from "ethers";
import {asERC721, ERC721ABI, ERC721Contract, ERC721EnumerableABI, ERC721MetadataABI} from "./base/ERC721";
import {OniRonin} from "./ContractTypes";

const ONI_RONIN_ADDRESS = "0x2127fe7ffce4380459cced92f2d4793f3af094a4";

export class OniRoninContract {
    private readonly contract;
    public readonly ERC721: ERC721Contract<OniRonin>;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(ONI_RONIN_ADDRESS, ERC721ABI(ERC721EnumerableABI(ERC721MetadataABI())), provider);
        this.ERC721 = asERC721(this.contract);
    }
}
