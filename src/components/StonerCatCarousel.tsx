import {Swiper, SwiperSlide} from "swiper/react/swiper-react";
import { StonerCatCarouselItem } from "./StonerCatCarouselItem";
import React from "react";
import { StonerCatAndPoster } from "../ethereum/contracts/StonerCatsContract";
import {Text} from "evergreen-ui";

export interface StonerCatCarouselProps {
    catProps: StonerCatAndPoster[];
}

export function StonerCatCarousel(props: StonerCatCarouselProps) {
    const {catProps} = props;
    return catProps.length > 0 ?
        <Swiper slidesPerView={(catProps.length > 2) ? 2 : 1}
                centeredSlides={true}
                navigation={true}
                loop={true}
                pagination={true}
                onSlideChange={(swiper) => {
                    // This drops a callback when the slide changes.
                    // BUT it has an issue when loop=true
                    // where it sometimes fires off the same index twice when wrapping

                    // console.log(`did THIS swipe? ${swiper.realIndex}`);
                }}
                onSwiper={swiper => {
                    // This method might just mean the swiper is ready
                    // console.log(`Swiped to index: ${swiper.realIndex}`);
                }}
                onClick={(swiper, event) => {
                    // console.log(`realIndex: ${swiper.realIndex} == ${data.catProps[swiper.realIndex % data.catProps.length].tokenId}`);
                }}
        >
            {catProps.map((stonerCatProps) => {
                return (
                    <SwiperSlide key={stonerCatProps.cat.tokenId.toString()}>
                        {(<StonerCatCarouselItem {...stonerCatProps} />)}
                    </SwiperSlide>
                );
            })}
        </Swiper> : <Text fontWeight={'bold'}>No Stoner Cats Found</Text>;
}
