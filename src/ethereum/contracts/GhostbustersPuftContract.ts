import {ethers} from "ethers";
import {Result} from "@ethersproject/abi/lib/coders/abstract-coder";
import {asERC721, ERC721ABI, ERC721Contract, ERC721MetadataABI} from "./base/ERC721";
import {GhostbustersPuft} from "./ContractTypes";
import {Address} from "../Web3Types";

const GHOSTBUSTERS_PUFT_ADDRESS = "0x916758C4588D0614488F2C53dDC6c337a245d7d7";

export class GhostbustersPuftContract {
    private readonly contract;
    public readonly ERC721: ERC721Contract<GhostbustersPuft>;

    constructor(provider: ethers.providers.Web3Provider) {
        this.contract = new ethers.Contract(GHOSTBUSTERS_PUFT_ADDRESS, ERC721ABI(ERC721MetadataABI()), provider);
        this.ERC721 = asERC721(this.contract);
    }

    async tokenOwner(ownerAddress: Address): Promise<number[]> {
        const filter = this.contract.filters.Transfer(null, ownerAddress);
        const events = await this.contract.queryFilter(filter);

        const receivedIds = await Promise.all(events.map(async event => {
            const {args} = event;
            // const {event: name, args, getTransaction, getTransactionReceipt} = event;
            const {_tokenId: tokenId} = args as Result;
            // const {_from: from, _to: to, } = args as Result;

            return tokenId as string;
        }));

        const ownedIds = await Promise.all(receivedIds.map(async tokenId => {
            const currentOwner = await this.ERC721.ownerOf(tokenId);
            if (currentOwner === ownerAddress) {
                return parseInt(tokenId);
            }
        }));

        return ownedIds.filter(item => {
            return item !== undefined;
        }) as number[];
    }
}
