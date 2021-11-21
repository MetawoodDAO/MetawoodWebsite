import {BigNumber} from "ethers";
import {Button, Heading, Image, Link, Pane, ShareIcon, Text} from "evergreen-ui";

export interface StonerCatAttributes {
    trait_type: "Name"|"Eyes",
    value: string
}

export interface StonerCatPoster {
    claimable: boolean;
}

export interface StonerCatJson {
    name: string;
    image: string;
    attributes: StonerCatAttributes[];
}

export interface StonerCatProps {
    tokenId: BigNumber;
    json: StonerCatJson;
    poster: StonerCatPoster;
}

export function StonerCat(props: StonerCatProps) {
    const nameAttribute = props.json.attributes.find((attr) => {
        return attr.trait_type === "Name";
    });

    return (
        <Pane width={'360px'} marginBottom={'30px'} onClick={() => {console.log("Pane caught a click. id: " + props.tokenId)}}>
            <Image maxHeight={'360px'} src={props.json.image} />
            <Heading>
                {nameAttribute ? nameAttribute.value : props.json.name}
            </Heading>
            <Text width={'-webkit-fit-content'}>
                Token id: {props.tokenId.toString()}
            </Text>
            <br />
            { props.poster.claimable ?
                <Link href={'https://stonercatsposters.com'} target={'_blank'} rel={'noopener noreferrer'} onClick={(event: any) => {event.preventDefault();}}>
                    <Button appearance={'primary'} iconAfter={ShareIcon}>
                        Unclaimed poster! Claim now!
                    </Button>
                </Link>
                : null
            }
        </Pane>
    );
}
