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

export interface TokenAttributes<T> {
    trait_type: T;
    value: string;
}

export interface ERC721Token<T> {
    tokenId: BigNumber;
    tokenUriData: T;
}

export interface ERC721Contract<T> {
    name(): Promise<string>;
    balanceOf(address: Address): Promise<BigNumber>;
    tokenURI(tokenId: BigNumberish): Promise<string>;
    ownerOf(tokenId: BigNumberish): Promise<Address>;
    tokenOfOwnerByIndex(address: Address, index: BigNumberish): Promise<BigNumber>;

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
            if (numberOfTokens.eq(0)) {
                return [];
            }

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
