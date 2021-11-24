import {Button, Pane, Text} from "evergreen-ui";

export interface HeaderProps {

}

export function Header(props: HeaderProps) {
    return (
        <Pane width={"100%"} height={"200px"}>
            <Pane float={'left'}>
                <Text fontWeight={'bolder'} fontSize={'36'}>Page Title</Text>
            </Pane>

            <Pane float={'right'}>
                <Button appearance={"primary"}>
                    Metamask Button
                </Button>
            </Pane>
        </Pane>
    );
}
