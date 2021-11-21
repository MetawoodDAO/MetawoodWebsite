import React, {useEffect, useState} from 'react';
import {StonerCat, StonerCatProps} from "./components/StonerCat";
import {Alert, Button, Pane, Text} from "evergreen-ui";
import {Swiper, SwiperSlide} from "swiper/react/swiper-react";
import SwiperCore, {
    Pagination,
    Navigation
} from 'swiper';
import {Web3Controller} from "./ethereum/Web3Controller";
import {isError} from "./utils/Utils";
import { StonerCatsContract, StonerCatsPosterContract } from "./ethereum/contracts/StonerCatsContract";
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
    address: string;
    catProps: StonerCatProps[]
}

async function updateData(): Promise<ChainData> {
    const providerBundle = await __web3Controller.getProvider();

    const stonerCatsContract = new StonerCatsContract(providerBundle);
    const stonerCatsPosterContract = new StonerCatsPosterContract(providerBundle);

    // Load the token ids of the current account
    const tokens = await stonerCatsContract.tokensOfProvider();

    const catProps: StonerCatProps[] = await Promise.all(tokens.map(async (tokenId) => {
        // Load the metadata for the current token
        const uri = await stonerCatsContract.tokenURI(tokenId);
        const response = await fetch(uri);
        const json = await response.json();

        // Also check to see if the poster is still claimable
        const claimable = await stonerCatsPosterContract.claimable(tokenId);

        return {
            tokenId,
            poster: {
                claimable
            },
            json
        }
    }));

    // Return all relevant data
    return {
        address: providerBundle.address,
        catProps
    };
}

const __web3Controller = new Web3Controller();

function App() {
    // Singleton instance of the Web3Controller
    // The lazy initialization means it'll only create the controller at the start (when it's undefined)
    // const [web3Controller] = useState<Web3Controller>(() => new Web3Controller());

    const [data, setData] = useState<ChainData>({
        address: "No Connected Address",
        catProps: []
    });
    const [error, setError] = useState<Error>();

    async function onClick() {
        // Clear the error pane
        setError(undefined);

        try {
            setData(await updateData());
        } catch (err: any) {
            if (isError(err)) {
                setError(err);
            }
            setData({catProps: [], address: 'No Connected Address'});
        }
    }

    // Run only on first render (because of empty dependencies)
    useEffect(() => {
        __web3Controller.addAccountsChangedHandler(async (accounts: string[]) => {
            if (accounts.length > 0) {
                await onClick();
            } else {
                setError(new Error('No available accounts to connect to'));
            }
        });
        __web3Controller.addChainChangedHandler(async (newChainId: number) => {
            await onClick();
        });

        // Attempt to attach to the web3 event hooks
        const result = __web3Controller.attach();

        // If unable to attach (web3 wasn't injected) then tell the user
        if (!result.success) {
            setError(new Error(result.message));
            return;
        }

        return () => { __web3Controller.detatch() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Pane clearfix>
            <ErrorMessage errorMessage={error?.message} />
            <Button onClick={() => onClick()}>
                Update
            </Button>
            <Button onClick={() => {setData({...data, catProps: []})}}>
                Reset
            </Button>
            <Pane>
                <Text >Address: {data.address}</Text>
            </Pane>
            <br />

            {data.catProps.length > 0 ?
            <Swiper slidesPerView={(data.catProps.length > 2) ? 2 : 1}
                    centeredSlides={true}
                    navigation={true}
                    loop={true}
                    pagination={true}
                    onSlideChange={(swiper) => {
                        // This drops a callback when the slide changes.
                        // BUT it has an issue when loop=true
                        // where it sometimes fires off the same index twice when wrapping

                        // console.log(`did THIS swipe? ${swiper.realIndex}`);
                    }}
                    onSwiper={swiper => {
                        // This method might just mean the swiper is ready
                        // console.log(`Swiped to index: ${swiper.realIndex}`);
                    }}
                    onClick={(swiper, event) => {
                        // console.log(`realIndex: ${swiper.realIndex} == ${data.catProps[swiper.realIndex % data.catProps.length].tokenId}`);
                    }}>
                {data.catProps.map((stonerCatProps) => {
                    return (
                        <SwiperSlide key={stonerCatProps.tokenId.toString()}>
                            {(<StonerCat tokenId={stonerCatProps.tokenId}
                                       json={stonerCatProps.json}
                                       poster={stonerCatProps.poster} />)
                            }
                        </SwiperSlide>
                    );
            })}
            </Swiper>
                : null}
        </Pane>
    );
}

function ErrorMessage(props: {errorMessage?: string}) {
    if (!props.errorMessage) {
        return null;
    }
    return (
        <Alert>
            {props.errorMessage}
        </Alert>
    );
}

export default App;
