import {Button, Heading, Image, Link, Pane, ShareIcon, Text} from "evergreen-ui";
import { StonerCatAndPoster } from "../ethereum/contracts/StonerCatsContract";

export function StonerCatCarouselItem(props: StonerCatAndPoster) {
    const nameAttribute = props.cat.catData.attributes.find((attr) => {
        return attr.trait_type === "Name";
    });

    return (
        <Pane width={'360px'} marginBottom={'30px'} onClick={() => {console.log("Pane caught a click. id: " + props.cat.tokenId)}}>
            <Image maxHeight={'360px'} src={props.cat.catData.image} />
            <Heading>
                {nameAttribute ? nameAttribute.value : props.cat.catData.name}
            </Heading>
            <Text width={'-webkit-fit-content'}>
                Token id: {props.cat.tokenId.toString()}
            </Text>
            <br />
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
