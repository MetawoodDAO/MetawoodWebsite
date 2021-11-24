import {ethers} from "ethers";
import {asERC721, ERC721ABI, ERC721Contract, TokenAttributes} from "./base/ERC721";

const ONI_RONIN_ADDRESS = "0x2127fe7ffce4380459cced92f2d4793f3af094a4";

type OniRoninTraits = "Haiku"|"Cloth"|"Armour"|"Shoulders"|"Mask"|"Horns"|"Antennae"|"Crest"|"Wing Straps"|"Soul";

export interface OniRonin {
    attributes: TokenAttributes<OniRoninTraits>[];
    name: string;
    description: string;
    image: string;
    external_url: string;
}

export class OniRoninContract {
    private readonly contract;
    public readonly ERC721: ERC721Contract<OniRonin>;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(ONI_RONIN_ADDRESS, ERC721ABI(), provider);
        this.ERC721 = asERC721(this.contract);
    }
}
