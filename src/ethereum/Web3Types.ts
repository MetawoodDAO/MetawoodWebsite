import { ethers } from "ethers";

export type Address = string;

interface BaseWeb3FailureReason {
    reason: 'NOT_INSTALLED' | 'NOT_CONNECTED' | 'PENDING_CONNECTION' | 'PENDING_NETWORK_SWITCH';
}
interface NOT_MAINNET {
    reason: 'NOT_MAINNET';
    chainId: number;
}
export type Web3FailureReason = BaseWeb3FailureReason | NOT_MAINNET;

export function isWeb3Failure(item: object): item is Web3FailureReason {
    return (item as Web3FailureReason).reason !== undefined;
}

interface FullProvider {
    provider: ethers.providers.Web3Provider;
    address: Address;
}

export type ProviderBundle = FullProvider | Web3FailureReason;
