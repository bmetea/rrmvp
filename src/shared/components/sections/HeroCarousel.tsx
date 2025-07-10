"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Link from "next/link";
import Image from "next/image";
import { Ticket } from "lucide-react";
import { Competition } from "@/(pages)/competitions/(server)/competition.service";

interface HeroCarouselProps {
  competitions: Competition[];
}

function HeroCarousel({ competitions }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!Array.isArray(competitions) || competitions.length === 0) {
    return (
      <div className="relative bg-black text-white py-32 text-center">
        <h1 className="text-[63px] font-medium leading-[1.2em] font-sans">
          No Active Competitions
        </h1>
      </div>
    );
  }

  // Get the current active competition based on slide index
  const activeCompetition = competitions[activeSlide] || competitions[0];
  const endDate = activeCompetition?.end_date
    ? new Date(activeCompetition.end_date)
    : null;
  const formattedEndDate = endDate?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const drawText = formattedEndDate
    ? `Draw ends ${formattedEndDate}`
    : "Draw date to be announced";

  return (
    <div className="relative bg-white dark:bg-gray-900">
      {/* Square Image Carousel */}
      <Swiper
        slidesPerView={1}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay]}
        className="w-full aspect-square"
        onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
      >
        {competitions.map((competition) => {
          if (!competition?.id) return null;

          return (
            <SwiperSlide key={competition.id}>
              <Link
                href={`/competitions/${competition.id}`}
                className="block w-full aspect-square relative overflow-hidden"
              >
                <div className="w-full h-full relative pb-24 md:pb-32">
                  <Image
                    src={
                      competition.media_info?.images?.[0] ||
                      "/images/hero-bg-optimized.jpg"
                    }
                    alt={competition.title || "Competition"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    quality={75}
                    priority
                  />
                  {/* Gradient fade overlay */}
                  <div
                    className="absolute bottom-0 left-0 w-full h-48 md:h-56 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 100%)",
                    }}
                  />
                  {/* Text content in the fade area */}
                  <div className="absolute bottom-8 md:bottom-12 left-0 w-full z-10 pointer-events-none">
                    <div className="w-full max-w-3xl mx-auto px-6 text-center">
                      <h2
                        className="text-white text-[35px] md:text-[63px] font-medium leading-[1.2em] mb-2 drop-shadow-lg font-sans"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
                      >
                        {activeCompetition?.title || "Competition"}
                      </h2>
                      <p className="text-[#E19841] text-[14px] md:text-[18px] font-normal leading-[1.5em] tracking-wide drop-shadow-lg font-open-sans">
                        {drawText}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Enter Now Button - Full Width, No Spacing */}
      <Link
        href={`/competitions/${activeCompetition?.id || "#"}`}
        className="block w-full"
      >
        <div className="w-full bg-[#E19841] hover:bg-[#E19841]/90 text-[#151515] font-semibold text-[16px] md:text-[18px] leading-[1.5em] py-4 md:py-6 transition-colors cursor-pointer font-open-sans">
          <div className="flex items-center justify-center gap-2">
            <span>Enter now</span>
            <Ticket className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default HeroCarousel;
