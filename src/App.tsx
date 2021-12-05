import React, {useState} from 'react';
import "./App.css";
import 'swiper/swiper-bundle.css';
import {Alert, Pane, Tab, Tablist} from "evergreen-ui";
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

function getContent(tabIndex: number) {
    switch (tabIndex) {
        case 0:
            return (
                <Pane width={'50%'} margin={12} paddingTop={4} paddingBottom={4} border borderWidth={4}
                      borderRadius={8}>
                    <StonerCatCarousel/>
                </Pane>);
        case 1:
            return <GnosisComponent />
        default:
            break;
    }
}

function App() {
    const web3State = useAppSelector(state => state.web3State.state);

    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const tabs = ['Stoner Cats', 'Gnosis Vault'];

    return (
        <Pane clearfix>
            <Header />

            {web3State.connected ? null : <Alert>Reason for failure: {web3State.reason.reason}{web3State.message ? ` message: ${web3State.message}` : ""}</Alert>}

            <Tablist>
                {tabs.map((tabTitle, index) => {
                    return (<Tab key={tabTitle} isSelected={index === selectedTabIndex} onSelect={() => setSelectedTabIndex(index)}>
                        {tabTitle}
                    </Tab>);
                })}
            </Tablist>

            {getContent(selectedTabIndex)}
        </Pane>
    );
}

export default App;
