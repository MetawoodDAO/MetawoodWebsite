import {useAppSelector} from "../redux/ReduxStore";
import {ListItem, Pane, Paragraph, Spinner, Text, UnorderedList} from "evergreen-ui";
import React from "react";
import {GnosisData} from "../ethereum/contracts/ContractTypes";
import {ethers} from "ethers";

function buildOniPane(gnosisData: GnosisData) {
    return (<Pane border borderWidth={2} margin={8} background={'orangeTint'}>
        {gnosisData.oniTokens && gnosisData.oniTokens.length > 0 ?
            <UnorderedList maxHeight={300} overflowY={'scroll'}>
                {gnosisData.oniTokens.map((oni, ndx) => {
                    return <ListItem>
                        <Text fontWeight={'bold'}>ONI ID: {oni.tokenId.toString()}</Text>
                        <br/>
                        <Text wordWrap={"break-word"}>
                            {JSON.stringify(oni.tokenUriData)}
                        </Text>
                    </ListItem>
                })}
            </UnorderedList>
            : <Text>No Oni Ronin</Text>
        }
    </Pane>);
}

function buildPuftPane(gnosisData: GnosisData) {
    return (<Pane border borderWidth={2} margin={8} background={'blueTint'}>
        <UnorderedList maxHeight={300} overflowY={'scroll'}>
            {gnosisData.puftTokenIds.map(tokenId => {
                return (<ListItem>
                    <Text>PUFT ID: {tokenId.toString()}</Text>
                </ListItem>);
            })}
        </UnorderedList>
    </Pane>);
}

export function GnosisComponent() {
    const data = useAppSelector(state => state.gnosis.data);

    if (data.state === 'Loading') {
        return (<Spinner />);
    }
    if (data.state === 'Error') {
        return <Text>{data.message}</Text>
    }

    const gnosisData = data.gnosisData;

    return gnosisData !== undefined ?
        <Pane border borderWidth={4} borderRadius={8} marginTop={12}>
            <Paragraph marginLeft={18}>
                <Text>
                    ETH Balance: {ethers.utils.formatEther(gnosisData.balance)}
                </Text>
            </Paragraph>

            <Pane border borderWidth={2} margin={6} background={'blueTint'} padding={8}>
                <Text fontWeight={'bold'}>SIGNERS</Text>
                <Paragraph>
                    <Text fontFamily={'mono'}>
                        Current threshold to approve transactions: {gnosisData.threshold}
                    </Text>
                </Paragraph>
                {gnosisData.owners ?
                    <UnorderedList>
                        {gnosisData.owners.map((ownerENSName) => {
                            return <ListItem>
                                <Text>{ownerENSName.name ?? ownerENSName.address}</Text>
                            </ListItem>
                        })}
                    </UnorderedList> : null
                }
            </Pane>

            {buildOniPane(gnosisData)}

            {buildPuftPane(gnosisData)}

        </Pane> : null;
}
