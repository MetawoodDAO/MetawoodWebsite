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
import {OniRoninContract} from "./ethereum/contracts/OniRoninContract";
import {GNOSIS_SAFE_ADDRESS, GnosisController} from "./ethereum/gnosis/GnosisController";
import { BigNumber } from "ethers";
import {StonerCatCarousel} from "./components/StonerCatCarousel";
import {Header} from "./components/Header";
import {isWeb3Failure, Web3FailureReason} from "./ethereum/Web3Types";
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

interface ChainData {
    catProps?: StonerCatAndPoster[];
}

interface GnosisData {
    balance: string;
    owners: string[];
    modules: string[];
    oniTokenIds: BigNumber[];
    oniUriData: any[];
}

// This is my way of interfacing with Metamask.
// This _should_ be the only thing that needs to be swapped out to support more wallets
const web3Controller = new Web3Controller();

function setup(refreshUI: (updateAccountAgnostic: boolean)=>Promise<void>, setError: (err: Web3FailureReason)=>void) {
    return () => {
        web3Controller.addConnectedHandler(async (chainId: number) => {
            await refreshUI(true);
        });
        web3Controller.addAccountsChangedHandler(async (accounts: string[]) => {
            await refreshUI(false);
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


async function updateData(askForAccount: boolean, askToSwitchNetworks: boolean): Promise<ChainData | Web3FailureReason> {
    const providerBundle = await web3Controller.getProviderBundle(askForAccount, askToSwitchNetworks);
    if (isWeb3Failure(providerBundle)) {
        return providerBundle;
    }

    const stonerCatsContract = new StonerCatsContract(providerBundle.provider);
    const stonerCatsPosterContract = new StonerCatsPosterContract(providerBundle.provider);

    const cats = await stonerCatsContract.getStonerCats(providerBundle.address);
    const catProps = await Promise.all(cats.map(async cat => {
        const claimable = await stonerCatsPosterContract.claimable(cat.tokenId);
        return {
            poster: {
                claimable
            },
            cat
        }
    }));
    return { catProps };

}

function App() {
    // Singleton instance of the Web3Controller
    // The lazy initialization means it'll only create the controller at the start (when it's undefined)
    // const [web3Controller] = useState<Web3Controller>(() => new Web3Controller());

    const [data, setData] = useState<ChainData>({});
    const [gnosisData, setGnosisData] = useState<Partial<GnosisData>>({});
    const [error, setError] = useState<Web3FailureReason|Error>();

    const clearUI = () => {
        setData({});
    }

    const refreshUI = async (askForAccount: boolean, askToSwitchNetwork: boolean) => {
        // Clear the error pane
        setError(undefined);

        try {
            const latestData = await updateData(askForAccount, askToSwitchNetwork);
            if (isWeb3Failure(latestData)) {
                setError(latestData);
                clearUI();
            } else {
                setData(latestData);
            }
        } catch (err: any) {
            console.error(err);
            if (isError(err)) {
                clearUI();
                setError(err);
            }
        }
    }

    const refreshGnosisUI = async (showMetaMaskPopup = false) => {
        setGnosisData({});

        const providerBundle = await web3Controller.getProviderBundle(showMetaMaskPopup);
        if (isWeb3Failure(providerBundle)) {
            return;
        }

        const gnosisController = GnosisController.with(providerBundle.provider);
        try {
            const balance = await gnosisController.getSafeValue();
            const owners = await gnosisController.getOwnerAddresses();
            // const modules = await gnosisController.getModules();

            let tokenIds: BigNumber[] = [];
            let uriData = []
            try {
                const oniRoninContract = new OniRoninContract(providerBundle.provider);
                tokenIds = await oniRoninContract.getTokensOfAddress(GNOSIS_SAFE_ADDRESS);

                uriData = await Promise.all(tokenIds.map(async (tokenId) => {
                    const uri = (await oniRoninContract.ERC721.tokenURI(tokenId)) as string;
                    return await (await fetch(uri)).json();
                }));
            } catch (err) {
                console.error(err);
            }

            setGnosisData({
                balance: balance.toString(),
                owners,
                // modules,
                oniTokenIds: tokenIds,
                oniUriData: uriData,
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Run only on first render (because of empty dependencies)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(setup(async (refreshAccountAgnostic: boolean) => {
        // Always refresh the current holdings
        await refreshUI(false, false);

        // Don't always refresh the data that isn't dependent on the current wallet
        if (refreshAccountAgnostic) {
            await refreshGnosisUI();
        }
        }, setError), []);

    /*
    <Pane>
        <Text >Address: {data.address ?? "No connected wallet"}</Text>
    </Pane>
    */

    return (
        <Pane clearfix>

            <Header />

            <Pane>
                <ErrorMessage failureReason={error} />
                <Button onClick={() => { refreshUI(true, false); }}>
                    {data.catProps ? "Refresh Data" : "Connect Metamask"}
                </Button>
                <Button onClick={() => { clearUI(); }}>
                    Reset
                </Button>



                <br />

                <StonerCatCarousel catProps={data.catProps ?? []} />
            </Pane>

            <Pane>
                <Button onClick={() => { refreshGnosisUI(true); }}>
                    Refresh Gnosis Data
                </Button>
                <Paragraph>
                    <Text>
                        ETH Balance: {gnosisData.balance}
                    </Text>
                </Paragraph>
                <Paragraph marginTop={"24px"}><Text fontWeight={'bold'}>SIGNERS</Text></Paragraph>
                { gnosisData.owners ?
                    <UnorderedList>
                        {gnosisData.owners.map((ownerAddress) => {
                            return <ListItem>
                                <Text>{ownerAddress}</Text>
                            </ListItem>
                        })}
                    </UnorderedList> : null
                }

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

                {gnosisData.oniTokenIds && gnosisData.oniTokenIds.length > 0 ?
                    <UnorderedList marginTop={'24px'}>
                        {gnosisData.oniTokenIds.map((oniId, ndx) => {
                            return <ListItem>
                                <Text fontWeight={'bold'}>ONI ID: {oniId.toString()}</Text>
                                <br/>
                                { gnosisData.oniUriData ?
                                    <Text>{JSON.stringify(gnosisData.oniUriData[ndx] ?? {})}</Text>
                                    : null }
                            </ListItem>
                        })}
                    </UnorderedList>
                    : <Text>No Oni Ronin</Text>
                }
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
