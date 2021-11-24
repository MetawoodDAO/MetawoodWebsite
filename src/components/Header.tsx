import {Button, Pane, Text} from "evergreen-ui";

export interface HeaderProps {
    reloadProvider(): void;
    isConnected: boolean;
    address?: string;
}

export function Header(props: HeaderProps) {
    return (
        <Pane width={"100%"} height={"100px"}>
            <Pane float={'left'}>
                <Text fontWeight={'bolder'} fontSize={'36'}>Page Title</Text>
            </Pane>

            <Pane float={'right'}>
                <Button appearance={"primary"} onClick={() => { props.reloadProvider(); }}>
                    {props.isConnected ? props.address : "Connect to Metamask"}
                </Button>
            </Pane>
        </Pane>
    );
}
