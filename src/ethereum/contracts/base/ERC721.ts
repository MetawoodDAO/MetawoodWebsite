import {Address} from "../../Web3Types";
import {BigNumber, BigNumberish, ethers} from "ethers";
import {mergeArrays} from "../../../utils/Utils";

/*
https://eips.ethereum.org/EIPS/eip-721
 */

export function ERC721ABI(baseAbi?: string[]): string[] {
    return mergeArrays(baseAbi ?? [], [
        "function balanceOf(address owner) public view returns (uint256)",
        "function ownerOf(uint256 tokenId) public view returns (address)",

        "event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)",
    ]);
}

export function ERC721MetadataABI(baseAbi?: string[]): string[] {
    return mergeArrays(baseAbi, [
        "function name() public view returns (string memory)",
        "function tokenURI(uint256 tokenId) public view returns (string memory)",
    ]);
}

export function ERC721EnumerableABI(baseAbi?: string[]): string[] {
    return mergeArrays(baseAbi, [
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
    ]);
}

export interface TokenAttributes<T> {
    trait_type: T;
    value: string;
}

export interface ERC721Token<T> {
    tokenId: BigNumber;
    tokenUriData: T;
}

export interface ERC721Contract<T> {
    // Core
    balanceOf(address: Address): Promise<BigNumber>;
    ownerOf(tokenId: BigNumberish): Promise<Address>;

    // Metadata
    name(): Promise<string>;
    tokenURI(tokenId: BigNumberish): Promise<string>;

    // Enumerable
    tokenOfOwnerByIndex(address: Address, index: BigNumberish): Promise<BigNumber>;

    // Custom
    fullyResolveURI(tokenId: BigNumberish): Promise<ERC721Token<T>>;
    getAllTokenIdsOwnedByAddress(address: Address): Promise<BigNumber[]>;
    getAllFullyResolvedTokensOwnedByAddress(address: Address): Promise<ERC721Token<T>[]>;
}

export function asERC721<T>(contract: ethers.Contract): ERC721Contract<T> {
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

        fullyResolveURI: async function (tokenId: BigNumberish): Promise<ERC721Token<T>> {
            const uri = await this.tokenURI(tokenId);
            const response = await fetch(uri);
            const tokenUriData = await response.json();
            return {
                tokenId: BigNumber.from(tokenId),
                tokenUriData,
            }
        },
        getAllTokenIdsOwnedByAddress: async function (address: Address): Promise<BigNumber[]> {
            const numberOfTokens = await this.balanceOf(address);

            const tokenIds: BigNumber[] = [];
            for (let i = 0; i < numberOfTokens.toNumber(); ++i) {
                const tokenId = await this.tokenOfOwnerByIndex(address, i);
                tokenIds.push(tokenId);
            }

            return tokenIds;
        },
        getAllFullyResolvedTokensOwnedByAddress: async function (address: Address): Promise<ERC721Token<T>[]> {
            const tokenIds = await this.getAllTokenIdsOwnedByAddress(address);
            return await Promise.all(tokenIds.map( async tokenId => {
                return await this.fullyResolveURI(tokenId);
            }));
        },
    };
}
