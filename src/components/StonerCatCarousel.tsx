import {Swiper, SwiperSlide} from "swiper/react/swiper-react";
import { StonerCatCarouselItem } from "./StonerCatCarouselItem";
import React from "react";
import {Text} from "evergreen-ui";
import {useAppSelector} from "../redux/ReduxStore";

export function StonerCatCarousel() {
    const cats = useAppSelector(state => state.stonerCats.catsAndPosters);

    return cats !== undefined && cats.length > 0 ?
        <Swiper slidesPerView={(cats.length > 2) ? 2 : 1}
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
                }}>

            {cats.map((stonerCatAndPoster) => {
                return (
                    <SwiperSlide key={stonerCatAndPoster.cat.tokenId.toString()}>
                        {(<StonerCatCarouselItem {...stonerCatAndPoster} />)}
                    </SwiperSlide>
                );
            })}
        </Swiper> :
        <Text fontWeight={'bold'}>No Stoner Cats Found</Text>;
}
