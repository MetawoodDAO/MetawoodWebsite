import {Button, Pane, Text} from "evergreen-ui";
import {useAppSelector} from "../redux/ReduxStore";

export interface HeaderProps {
    connectToMetaMask(): void;
}

export function Header(props: HeaderProps) {
    const web3State = useAppSelector(state => state.web3State.state);

    return (
        <Pane width={"100%"} height={"100px"}>
            <Pane float={'left'}>
                <Text fontWeight={'bolder'} fontSize={'36'}>Page Title</Text>
            </Pane>

            <Pane float={'right'}>
                <Button appearance={"primary"} onClick={() => { props.connectToMetaMask(); }}>
                    {web3State.connected ? web3State.address : "Connect to Metamask"}
                </Button>
            </Pane>
        </Pane>
    );
}
