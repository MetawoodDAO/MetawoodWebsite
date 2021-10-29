import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Alert, Button, Carousel, CarouselItem, Container, ListGroup, ListGroupItem} from "react-bootstrap";
import {BigNumber, ethers} from "ethers";
import {StonerCat, StonerCatProps} from "./components/StonerCat";

const STONER_CATS_ADDRESS = "0xD4d871419714B778eBec2E22C7c53572b573706e";
const STONER_CATS_ABI = [
    "function tokensOfOwner(address _owner) external view returns(uint256[] memory)",
    "function tokenURI(uint256 tokenId) public view virtual override returns (string memory)"
];
const STONER_CATS_CONTRACT = new ethers.Contract(STONER_CATS_ADDRESS, STONER_CATS_ABI);

const STONER_CATS_POSTER_ADDRESS = "0xA58723E04Af0e1c38213036b321e1243F8E16336";
const STONER_CATS_POSTER_ABI = [
    "function claimable(uint _tokenId) public view returns(bool)"
];
const STONER_CATS_POSTER_CONTRACT = new ethers.Contract(STONER_CATS_POSTER_ADDRESS, STONER_CATS_POSTER_ABI);

function getProvider(): ethers.providers.Web3Provider {
    // @ts-ignore
    if (!window.ethereum) {
        throw new Error("No crypto wallet found");
    }
    // @ts-ignore
    return new ethers.providers.Web3Provider(window.ethereum);
}

async function updateData(): Promise<ChainData> {
    const provider = getProvider();
    const signer = provider.getSigner();

    const address = await signer.getAddress();

    const tokens = await (STONER_CATS_CONTRACT.connect(provider).tokensOfOwner(address)) as BigNumber[];
    const catProps: StonerCatProps[] = await Promise.all(tokens.map(async (tokenId) => {
        const claimable = await (STONER_CATS_POSTER_CONTRACT.connect(provider).claimable(tokenId));


        const uri = await STONER_CATS_CONTRACT.connect(provider).tokenURI(tokenId) as string;
        const response = await fetch(uri);
        const json = await response.json();

        return {
            tokenId,
            poster: {
                claimable
            },
            json
        }
    }));

    return {
        blockNumber: await provider.getBlockNumber(),
        address,
        balance: (await signer.getBalance()),
        catProps
    };
}

interface ChainData {
    blockNumber: number;
    balance: BigNumber;
    address: string;
    catProps: StonerCatProps[]
}

function App() {
    const [data, setData] = useState<ChainData>({
        blockNumber: 0,
        address: "No Connected Address",
        balance: BigNumber.from(0),
        catProps: []
    });
    const [error, setError] = useState<Error>();

    async function onClick() {
        try {
            setData(await updateData());
        } catch (err: any) {
            if (err instanceof Error) {
                setError(err);
            }
        }
    }

    // <ListGroupItem>Balance: {ethers.utils.formatEther(data.balance)}</ListGroupItem>
    return (
        <Container fluid>
            <Button onClick={() => onClick()}>
                Update
            </Button>
            {data ?
                <ListGroup>
                    <ListGroupItem>Block Number: {data.blockNumber}</ListGroupItem>
                    <ListGroupItem>Address: {data.address}</ListGroupItem>
                </ListGroup> : null }
            <Container fluid={"md"} >
                <Carousel variant={"dark"}>
                    {data.catProps.map((stonerCatProps) => {
                        return (
                            <CarouselItem>

                                <div style={{width: "100%"}} className={"justify-content-md-center"}>
                                    <StonerCat tokenId={stonerCatProps.tokenId} json={stonerCatProps.json} poster={stonerCatProps.poster} />
                                </div>

                            </CarouselItem>
                        );
                    })}
                </Carousel>
            </Container>
            <ErrorMessage errorMessage={error?.message} />
        </Container>
    );
}

function ErrorMessage(props: {errorMessage?: string}) {
    if (!props.errorMessage) {
        return null;
    }
    return (
        <Alert variant={"danger"}>
            {props.errorMessage}
        </Alert>
    );
}

export default App;
