import {Button, Pane, Text} from "evergreen-ui";
import {useAppSelector} from "../redux/ReduxStore";
import {Web3ControllerReactContext} from "../ethereum/Web3Controller";

export function Header() {
    const web3State = useAppSelector(state => state.web3State.state);

    return (
        <Web3ControllerReactContext.Consumer>
            {web3Controller =>
                (<Pane width={"100%"} height={"100px"} paddingTop={16}>
                    <Pane float={'left'}>
                        <Text fontWeight={'bolder'} fontSize={'36'}>METAWOOD DAO</Text>
                    </Pane>

                    <Pane float={'right'}>
                        <Button appearance={"primary"} onClick={() => {
                            web3Controller.showMetamaskAccountPopup();
                        }}>
                            {web3State.connected ? web3State.address : "Connect to Metamask"}
                        </Button>
                    </Pane>
                </Pane>)
            }
        </Web3ControllerReactContext.Consumer>
    );
}
