"use client";

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
  if (!Array.isArray(competitions) || competitions.length === 0) {
    return (
      <div className="relative bg-black text-white py-32 text-center">
        <h1 className="text-[45px] md:text-[89px] leading-[120%] md:leading-[90%] font-extrabold">
          No Active Competitions
        </h1>
      </div>
    );
  }

  return (
    <div className="relative bg-black text-white">
      <Swiper
        slidesPerView={1}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay]}
        className="w-full h-[600px] md:h-[750px]"
      >
        {competitions.map((competition) => {
          if (!competition?.id) return null;

          const endDate = competition.end_date
            ? new Date(competition.end_date)
            : null;
          const formattedEndDate = endDate?.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const drawText = formattedEndDate
            ? `Draw ends ${formattedEndDate}`
            : "Draw date to be announced";

          return (
            <SwiperSlide key={competition.id}>
              <Link
                href={`/competitions/${competition.id}`}
                className="block w-full h-full"
              >
                <div className="relative w-full h-[600px] md:h-[750px]">
                  <Image
                    src={
                      competition.media_info?.thumbnail ||
                      "/images/hero-bg-optimized.jpg"
                    }
                    alt={competition.title || "Competition"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    quality={75}
                    priority
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute bottom-0 left-0 w-full h-56 md:h-72 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
                    }}
                  />
                  {/* Bottom overlay content */}
                  <div className="absolute bottom-0 left-0 w-full z-10 flex justify-start items-end h-56 md:h-72">
                    <div className="w-full max-w-3xl mx-auto px-6 pb-6 flex flex-col items-start">
                      <h2
                        className="text-white text-[35px] md:text-[85px] leading-[140%] md:leading-[120%] font-extrabold uppercase mb-2 drop-shadow-lg"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
                      >
                        {competition.title || "Competition"}
                      </h2>
                      <p className="text-[#E19841] text-[14px] md:text-[20px] leading-[150%] font-bold uppercase mb-4 tracking-wide drop-shadow-lg">
                        {drawText}
                      </p>
                      <div className="w-full flex justify-center">
                        <span className="inline-flex items-center gap-2 bg-[#E19841] hover:bg-[#D18A33] text-black font-semibold text-[20px] md:text-[25px] leading-[150%] px-8 py-3 rounded-lg shadow-lg transition-colors w-full max-w-md mx-auto justify-center cursor-pointer">
                          Enter now <Ticket size={22} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default HeroCarousel;
