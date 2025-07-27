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
      <div className="relative bg-black text-white py-32 text-center"></div>
    );
  }

  // Get the current active competition based on slide index
  const activeCompetition = competitions[activeSlide] || competitions[0];

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
            <Ticket className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default HeroCarousel;
