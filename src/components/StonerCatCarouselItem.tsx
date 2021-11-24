import {Button, Heading, Image, Link, Pane, ShareIcon, Text} from "evergreen-ui";
import { StonerCatAndPoster } from "../ethereum/contracts/StonerCatsContract";

export function StonerCatCarouselItem(props: StonerCatAndPoster) {
    const nameAttribute = props.cat.tokenUriData.attributes.find((attr) => {
        return attr.trait_type === "Name";
    });

    return (
        <Pane marginBottom={'30px'}>
            <Pane onClick={() => {console.log("Pane caught a click. id: " + props.cat.tokenId)}}>
                <Image maxHeight={'240px'} src={props.cat.tokenUriData.image} />
                <Heading>
                    {nameAttribute ? nameAttribute.value : props.cat.tokenUriData.name}
                </Heading>
                <Text width={'-webkit-fit-content'}>
                    Token id: {props.cat.tokenId.toString()}
                </Text>
            </Pane>

            { props.poster.claimable ?
                <Link href={'https://stonercatsposters.com'} target={'_blank'} rel={'noopener noreferrer'} onClick={(event: any) => {}}>
                    <Button appearance={'primary'} iconAfter={ShareIcon}>
                        Unclaimed poster! Claim now!
                    </Button>
                </Link>
                : null
            }
        </Pane>

    );
}
