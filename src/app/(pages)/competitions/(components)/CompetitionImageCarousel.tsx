"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Navigation } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CompetitionImageCarouselProps {
  images: string[];
  title: string;
}

export default function CompetitionImageCarousel({
  images,
  title,
}: CompetitionImageCarouselProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [swiperLoaded, setSwiperLoaded] = useState(false);

  // Fallback to placeholder if no images
  const displayImages =
    images.length > 0 ? images : ["/images/placeholder.jpg"];

  return (
    <div className="w-full">
      {/* Main Carousel */}
      <div className="relative mb-4">
        {/* Show first image immediately for LCP, then overlay with Swiper */}
        {!swiperLoaded && displayImages[0] && (
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
            <div className="w-full h-full relative">
              <Image
                src={displayImages[0]}
                alt={`${title} - Image 1`}
                fill
                className="object-cover"
                priority={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={75}
                loading="eager"
                fetchPriority="high"
                onLoad={() => setSwiperLoaded(true)}
              />
            </div>
          </div>
        )}

        {/* Swiper loads after first image or if only one image */}
        <Swiper
          spaceBetween={10}
          loop={displayImages.length > 1}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Thumbs, Navigation]}
          className={`w-full aspect-square rounded-2xl overflow-hidden shadow-lg ${
            !swiperLoaded && displayImages.length > 1
              ? "opacity-0"
              : "opacity-100"
          } transition-opacity duration-300`}
          onSwiper={() => setSwiperLoaded(true)}
        >
          {displayImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-full relative">
                <Image
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                  quality={index === 0 ? 75 : 60}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons - Only show if more than 1 image */}
        {displayImages.length > 1 && (
          <>
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if more than 1 image */}
      {displayImages.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[Thumbs]}
          className="w-full"
          breakpoints={{
            640: {
              slidesPerView: 5,
            },
            768: {
              slidesPerView: 6,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
        >
          {displayImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="w-full aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#E19841] transition-colors">
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                  quality={60}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
