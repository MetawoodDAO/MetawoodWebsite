import React from 'react';
import 'swiper/swiper-bundle.css';
import "./App.css";
import { Alert, Pane } from "evergreen-ui";
import SwiperCore, { Pagination, Navigation } from 'swiper';
import { StonerCatCarousel } from "./components/StonerCatCarousel";
import { Header } from "./components/Header";
import { GnosisComponent } from "./components/GnosisComponent";
import { useAppSelector } from "./redux/ReduxStore";

// UI Provided by Evergreen framework
// https://evergreen.segment.com/foundations
// https://evergreen.segment.com/components

// Literally just an npm module to get a carousel
// https://swiperjs.com/get-started
// https://swiperjs.com/demos
SwiperCore.use([Pagination, Navigation]);

function App(props: {connectToMetaMask(): void}) {
    const web3State = useAppSelector(state => state.web3State.state);

    return (
        <Pane clearfix>
            <Header connectToMetaMask={props.connectToMetaMask}/>

            {web3State.connected ? null : <Alert>Reason for failure: {web3State.reason.reason}</Alert>}

            <Pane width={'50%'} margin={12} paddingTop={4} paddingBottom={4} border borderWidth={4} borderRadius={8}>
                <StonerCatCarousel/>
            </Pane>

            <GnosisComponent />
        </Pane>
    );
}

export default App;
