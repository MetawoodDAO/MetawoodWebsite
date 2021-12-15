import {useAppSelector} from "../redux/ReduxStore";
import {ListItem, Pane, Paragraph, Spinner, Text, UnorderedList} from "evergreen-ui";
import React from "react";
import {GnosisData} from "../ethereum/contracts/ContractTypes";
import {ethers} from "ethers";

function buildOniPane(gnosisData: GnosisData) {
    return (<Pane border borderWidth={2} margin={4} background={'orangeTint'}>
        {gnosisData.oniTokens && gnosisData.oniTokens.length > 0 ?
            <UnorderedList maxHeight={300} overflowY={'scroll'} padding={8}>
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
    return (<Pane border borderWidth={2} margin={4} background={'greenTint'} width={"fit-content"}>
        <UnorderedList maxHeight={300} overflowY={'scroll'} padding={8}>
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
            <Pane margin={4} border borderWidth={2} background={'tealTint'} width={"fit-content"}>
                <Text fontSize={'large'} fontWeight={'bold'} padding={4}>
                    Gnosis Vault ETH Balance: {ethers.utils.formatEther(gnosisData.balance)}
                </Text>
            </Pane>

            <Pane border borderWidth={2} margin={4} background={'blueTint'} padding={8} width={"fit-content"}>
                <Text fontWeight={'bold'}>SIGNERS</Text>
                <Paragraph>
                    <Text fontFamily={'mono'}>
                        Current threshold to approve transactions:
                    </Text>
                    <Text fontWeight={"bold"} marginLeft={24} marginRight={8}>
                        {gnosisData.threshold}
                    </Text>
                    <Text fontFamily={'mono'}>
                        out of {gnosisData.owners?.length ?? 'unknown'} signers
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
