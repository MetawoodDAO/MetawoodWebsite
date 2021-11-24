import React, {useEffect, useState} from 'react';
import {Alert, Button, ListItem, Pane, Paragraph, Text, UnorderedList} from "evergreen-ui";
import SwiperCore, {
    Pagination,
    Navigation
} from 'swiper';
import { Web3Controller } from "./ethereum/Web3Controller";
import {isError} from "./utils/Utils";
import {
    StonerCatAndPoster,
    StonerCatsContract,
    StonerCatsPosterContract
} from "./ethereum/contracts/StonerCatsContract";
import {OniRonin, OniRoninContract} from "./ethereum/contracts/OniRoninContract";
import {GNOSIS_SAFE_ADDRESS, GnosisController} from "./ethereum/gnosis/GnosisController";
import { BigNumber } from "ethers";
import {StonerCatCarousel} from "./components/StonerCatCarousel";
import {Header} from "./components/Header";
import {isWeb3Failure, Web3FailureReason} from "./ethereum/Web3Types";
import {ERC721Token} from "./ethereum/contracts/base/ERC721";
// CSS imports
import 'swiper/swiper-bundle.css';
import "./App.css";

// UI Provided by Evergreen framework
// https://evergreen.segment.com/foundations
// https://evergreen.segment.com/components

// Literally just an npm module to get a carousel
// https://swiperjs.com/get-started
// https://swiperjs.com/demos
SwiperCore.use([Pagination, Navigation]);

interface GnosisData {
    balance: string;
    owners: string[];
    modules: string[];
    oniTokenIds: BigNumber[];
    oniTokens: ERC721Token<OniRonin>[];
}

// This is my way of interfacing with Metamask.
// This _should_ be the only thing that needs to be swapped out to support more wallets
const web3Controller = new Web3Controller();

function setup(refreshUI: (updateAccountAgnostic: boolean)=>Promise<void>, setError: (err: Web3FailureReason)=>void) {
    return () => {
        // This fires when we connect to MetaMask
        web3Controller.addConnectedHandler(async (chainId: number) => {
            await refreshUI(true);
        });
        web3Controller.addAccountsChangedHandler(async (accounts: string[]) => {
            await refreshUI(accounts.length === 0);
        });
        web3Controller.addChainChangedHandler(async (newChainId: number) => {
            await refreshUI(true);
        });

        // Attempt to attach to the web3 event hooks
        const result = web3Controller.attach();

        // If unable to attach (web3 wasn't injected) then tell the user
        if (result !== undefined) {
            setError(result);
            return;
        }

        return () => { web3Controller.detatch(); };
    }
}


function App() {
    const [cats, setCats] = useState<StonerCatAndPoster[] | undefined>();
    const [gnosisData, setGnosisData] = useState<Partial<GnosisData>>({});
    const [error, setError] = useState<Web3FailureReason|Error>();
    const [providerInfo, setProviderInfo] = useState<{isConnected: true, address: string} | {isConnected: false}>({isConnected: false});

    const refreshUI = async () => {
        // Clear the error pane
        setError(undefined);

        // Get the provider, or abort if we're not fully connected
        const providerBundle = await web3Controller.getProviderBundle();
        if (isWeb3Failure(providerBundle)) {
            setCats(undefined);
            setError(providerBundle);
            return;
        }

        // Load the Cat data and set it
        try {
            const stonerCatsContract = new StonerCatsContract(providerBundle.provider);
            const stonerCatsPosterContract = new StonerCatsPosterContract(providerBundle.provider);

            const catTokens = await stonerCatsContract.ERC721.getAllFullyResolvedTokensOwnedByAddress(providerBundle.address);
            const catsAndPosters = await Promise.all(catTokens.map(async cat => {
                const claimable = await stonerCatsPosterContract.claimable(cat.tokenId);
                return {
                    cat,
                    poster: {
                        claimable
                    }
                }
            }));

            if (isWeb3Failure(catsAndPosters)) {
                setError(catsAndPosters);
                setCats(undefined);
            } else {
                setCats(catsAndPosters);
            }
        } catch (err: any) {
            console.error(err);
            if (isError(err)) {
                setCats(undefined);
                setError(err);
            }
        }
    }

    const refreshGnosisUI = async () => {
        setGnosisData({});

        const providerBundle = await web3Controller.getProviderBundle();
        if (isWeb3Failure(providerBundle)) {
            return;
        }

        const gnosisController = GnosisController.with(providerBundle.provider);
        try {
            const balance = await gnosisController.getSafeValue();
            const owners = await gnosisController.getOwnerAddresses();
            // const modules = await gnosisController.getModules();

            let tokenIds: BigNumber[] = [];
            let uriData: ERC721Token<OniRonin>[] = []
            try {
                const oniRoninContract = new OniRoninContract(providerBundle.provider);
                tokenIds = await oniRoninContract.ERC721.getAllTokenIdsOwnedByAddress(GNOSIS_SAFE_ADDRESS);

                uriData = await Promise.all(tokenIds.map(async (tokenId) => {
                    return await oniRoninContract.ERC721.fullyResolveURI(tokenId);
                }));
            } catch (err) {
                console.error(err);
            }

            setGnosisData({
                balance: balance.toString(),
                owners,
                // modules,
                oniTokenIds: tokenIds,
                oniTokens: uriData,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const reloadProvider = async (showMetamaskAccountPopup = false) => {
        setError(undefined);

        await web3Controller.updateProvider(showMetamaskAccountPopup, false);

        const newProvider = web3Controller.getProviderBundle();
        if (isWeb3Failure(newProvider)) {
            setError(newProvider);
            setProviderInfo({isConnected: false});
            return;
        }
        setProviderInfo({
            isConnected: true,
            address: newProvider.address
        });
    }

    // Run only on first render (because of empty dependencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(setup(async (refreshAccountAgnostic: boolean) => {
        // First, make sure we have the latest Provider ready for use
        await reloadProvider();

        // Always refresh the current holdings
        await refreshUI();

        // Don't always refresh the data that isn't dependent on the current wallet
        if (refreshAccountAgnostic) {
            await refreshGnosisUI();
        }
    }, setError), []);

    return (
        <Pane clearfix>

            <Header reloadProvider={() => { reloadProvider(true); }} {...providerInfo} />

            <ErrorMessage failureReason={error} />

            <Pane width={'50%'} margin={12} paddingTop={4} paddingBottom={4} border borderWidth={4} borderRadius={8}>
                <StonerCatCarousel catProps={cats ?? []} />
            </Pane>

            <Pane border borderWidth={4} borderRadius={8} marginTop={12}>
                <Button onClick={() => { refreshGnosisUI(); }}>
                    Refresh Gnosis Data
                </Button>
                <Paragraph marginLeft={18}>
                    <Text>
                        ETH Balance: {gnosisData.balance}
                    </Text>
                </Paragraph>

                <Pane border borderWidth={2} margin={6} background={'blueTint'} padding={8}>
                    <Text fontWeight={'bold'}>SIGNERS</Text>
                    { gnosisData.owners ?
                        <UnorderedList>
                            {gnosisData.owners.map((ownerAddress) => {
                                return <ListItem>
                                    <Text>{ownerAddress}</Text>
                                </ListItem>
                            })}
                        </UnorderedList> : null
                    }
                </Pane>

                {gnosisData.modules ? <Paragraph>
                    <Text fontWeight={'bold'}>MODULES</Text>
                    <br/>
                    { gnosisData.modules.length > 0 ?
                        <UnorderedList>
                            {gnosisData.modules.map(module => {
                                return <ListItem>
                                    <Text>{module}</Text>
                                </ListItem>
                            })}
                        </UnorderedList>
                        : <Text>No Modules!</Text>
                    }
                </Paragraph> : null}

                <Pane border borderWidth={2} margin={8} background={'orangeTint'}>
                    {gnosisData.oniTokenIds && gnosisData.oniTokenIds.length > 0 ?
                        <UnorderedList maxHeight={300} overflowY={'scroll'}>
                            {gnosisData.oniTokenIds.map((oniId, ndx) => {
                                return <ListItem>
                                    <Text fontWeight={'bold'}>ONI ID: {oniId.toString()}</Text>
                                    <br/>
                                    { gnosisData.oniTokens ?
                                        <Text>{JSON.stringify(gnosisData.oniTokens[ndx].tokenUriData)}</Text>
                                        : null }
                                </ListItem>
                            })}
                        </UnorderedList>
                        : <Text>No Oni Ronin</Text>
                    }
                </Pane>
            </Pane>
        </Pane>
    );
}

function ErrorMessage(props: {failureReason?: Web3FailureReason|Error}) {
    const { failureReason } = props;
    if (!failureReason) {
        return null;
    }
    return (
        <Alert>
            {isError(failureReason) ? failureReason.message : failureReason.reason}
        </Alert>
    );
}

export default App;
