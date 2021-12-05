import {ERC721Token, TokenAttributes} from "./base/ERC721";
import {ENSName} from "../Web3Types";

type StonerCatTraits = "Name"|"Eyes"|"Left Arm"|"Right Arm"|"Expressions"|"Collars"|"Backdrops"|"Accessories";
export interface StonerCat {
    name: string;
    image: string;
    attributes: TokenAttributes<StonerCatTraits>[];
}

export interface StonerCatPoster {
    claimable: boolean;
}

export interface StonerCatAndPoster {
    cat: ERC721Token<StonerCat>;
    poster: StonerCatPoster;
}

export interface GnosisData {
    balance: string;
    owners: ENSName[];
    oniTokens: ERC721Token<OniRonin>[];
}

type OniRoninTraits = "Haiku"|"Cloth"|"Armour"|"Shoulders"|"Mask"|"Horns"|"Antennae"|"Crest"|"Wing Straps"|"Soul";
export interface OniRonin {
    attributes: TokenAttributes<OniRoninTraits>[];
    name: string;
    description: string;
    image: string;
    external_url: string;
}
