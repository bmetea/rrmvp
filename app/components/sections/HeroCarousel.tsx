"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import Image from "next/image";

function HeroCarousel({ competitions }) {
  if (!competitions.length) {
    return (
      <div className="relative bg-black text-white py-32 text-center">
        <h1 className="text-4xl font-bold">No Active Competitions</h1>
      </div>
    );
  }

  return (
    <div className="relative bg-black text-white">
      <Swiper slidesPerView={1} loop className="w-full h-[500px] md:h-[600px]">
        {competitions.map((competition) => (
          <SwiperSlide key={competition.id}>
            <Link
              href={`/competitions/${competition.id}`}
              className="block w-full h-full"
            >
              <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
                <Image
                  src={
                    competition.media_info?.thumbnail ||
                    "/images/hero-bg-optimized.jpg"
                  }
                  alt={competition.title}
                  fill
                  className="object-cover opacity-60"
                  sizes="100vw"
                  quality={75}
                  priority
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-center drop-shadow-lg">
                    {competition.title}
                  </h2>
                  <p className="text-lg md:text-2xl mb-6 max-w-2xl text-center text-white/80">
                    {competition.description}
                  </p>
                  <span className="inline-block bg-[#E19841] text-black font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-[#D18A33] transition-colors">
                    View Competition
                  </span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default HeroCarousel;
