"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import Link from "next/link";
import Image from "next/image";
import { Ticket } from "lucide-react";
import { Competition } from "@/(pages)/competitions/(server)/competition.service";
import { useAnalytics } from "@/shared/hooks";

interface HeroCarouselProps {
  competitions: Competition[];
}

function HeroCarousel({ competitions }: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { trackEvent } = useAnalytics();

  // Track hero carousel interactions
  const handleHeroImageClick = (competition: any) => {
    trackEvent("Hero Image Clicked", {
      competition_id: competition.id,
      competition_title: competition.title,
      image_url: competition.media_info?.images?.[0] || null,
    });
  };

  const handleHeroCTAClick = (competition: any) => {
    trackEvent("Hero CTA Clicked", {
      button_text: "Enter now",
      competition_id: competition.id,
      competition_title: competition.title,
      location: "hero_banner",
    });
  };

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
  const drawText = activeCompetition
    ? (() => {
        const endDate = new Date(activeCompetition.end_date);
        const now = new Date();
        const timeDiff = endDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysLeft <= 0) {
          return "Draw has ended";
        } else if (daysLeft === 1) {
          return "Draw ends tomorrow";
        } else if (daysLeft <= 7) {
          return `Draw ends in ${daysLeft} days`;
        } else {
          return "Just launched";
        }
      })()
    : "";

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        onSlideChange={(swiper) => {
          const activeIndex = swiper.realIndex;
          setActiveSlide(activeIndex);
        }}
        className="w-full h-full"
      >
        {competitions.map((competition) => {
          if (!competition?.id) return null;

          return (
            <SwiperSlide key={competition.id}>
              <Link
                href={`/competitions/${competition.id}`}
                onClick={() => handleHeroImageClick(competition)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={
                      competition.media_info?.images?.[0] ||
                      "/images/placeholder.jpg"
                    }
                    alt={competition.title || "Competition"}
                    fill
                    sizes="100vw"
                    quality={90}
                    priority
                    fetchPriority="high"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
        onClick={() =>
          activeCompetition && handleHeroCTAClick(activeCompetition)
        }
      >
        <div className="w-full bg-cta hover:bg-cta-hover text-cta-foreground font-semibold text-[16px] md:text-[18px] leading-[1.5em] py-4 md:py-6 transition-colors cursor-pointer font-open-sans">
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
