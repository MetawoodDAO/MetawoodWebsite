import {Alert, Card, CardImg, Image} from "react-bootstrap";
import {BigNumber} from "ethers";

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
        <Card style={{width: "18rem", textAlign: "center"}}>
            <CardImg as={Image} variant={"top"} src={props.json.image} />
            <Card.Body>
                <Card.Title>
                    {nameAttribute ? nameAttribute.value : props.json.name}
                </Card.Title>
                <Card.Text>
                    Token id: {props.tokenId.toString()}
                </Card.Text>
                <Alert variant={"info"}>
                    Poster still claimable: {""+props.poster.claimable}
                </Alert>
            </Card.Body>
        </Card>
    );
}
