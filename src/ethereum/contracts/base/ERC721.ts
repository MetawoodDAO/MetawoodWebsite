import {Address} from "../../Web3Types";
import {BigNumber, BigNumberish, ethers} from "ethers";
import {mergeArrays} from "../../../utils/Utils";

export function ERC721ABI(baseAbi?: string[]): string[] {
    return mergeArrays(baseAbi ?? [], [
        "function name() public view returns (string memory)",
        "function balanceOf(address owner) public view returns (uint256)",
        "function tokenURI(uint256 tokenId) public view returns (string memory)",
        "function ownerOf(uint256 tokenId) public view returns (address)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
    ]);
}

export interface ERC721Contract {
    name(): Promise<string>;
    balanceOf(address: Address): Promise<BigNumber>;
    tokenURI(tokenId: BigNumberish): Promise<string>;
    ownerOf(tokenId: BigNumberish): Promise<Address>;
    tokenOfOwnerByIndex(address: Address, index: BigNumberish): Promise<BigNumber>;

    fullyResolveURI(tokenId: BigNumberish): Promise<any>;
}

export function asERC721(contract: ethers.Contract): ERC721Contract {
    return {
        name: async function (): Promise<string> {
            return await contract.name();
        },
        balanceOf: async function (address: Address): Promise<BigNumber> {
            return await contract.balanceOf(address);
        },
        tokenURI: async function (tokenId: BigNumberish): Promise<string> {
            return await contract.tokenURI(tokenId);
        },
        ownerOf: async function (tokenId: BigNumberish): Promise<Address> {
            return await contract.ownerOf(tokenId);
        },
        tokenOfOwnerByIndex: async function (address: Address, index: BigNumberish): Promise<BigNumber> {
            return await contract.tokenOfOwnerByIndex(address, index);
        },

        fullyResolveURI: async function (tokenId: BigNumberish): Promise<object> {
            const uri = await this.tokenURI(tokenId);
            const response = await fetch(uri);
            return await response.json();
        }
    };
}
