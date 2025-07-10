import { Heart, Users } from "lucide-react";
import Link from "next/link";

const AboutSection = () => {
  return (
    <div className="w-full bg-[#F7F7F7] overflow-hidden px-4 py-16 lg:px-16 lg:py-20 flex flex-col justify-start items-center gap-20">
      <div className="w-full max-w-[1400px] relative overflow-hidden flex flex-col lg:flex-row justify-start items-stretch gap-12">
        {/* Main About Us Card - Black */}
        <div className="w-full lg:w-[720px] px-12 py-16 lg:py-22 bg-[#151515] overflow-hidden rounded-3xl flex flex-col justify-start items-center gap-8">
          <div className="w-full max-w-[560px] flex flex-col justify-start items-start gap-6">
            <div className="w-full flex flex-col justify-start items-start gap-6">
              {/* Title */}
              <div className="w-full text-white text-4xl lg:text-[63px] font-medium leading-tight lg:leading-[75.6px] font-sans">
                About us
              </div>
              {/* Highlighted subtitle */}
              <div className="w-full text-[#E19841] text-lg lg:text-2xl font-semibold leading-relaxed lg:leading-9 font-open-sans">
                At Radiance Rewards, we believe that everyone deserves the
                chance to feel confident, empowered, and beautiful—without the
                barriers of high costs.
              </div>
              {/* Body text */}
              <div className="w-full text-white text-base lg:text-lg font-normal leading-relaxed lg:leading-[27px] font-open-sans">
                That's why we've created a fun and exciting way to win
                life-changing cosmetic procedures and premium beauty products at
                a fraction of their usual price.
              </div>
              <div className="w-full text-white text-base lg:text-lg font-normal leading-relaxed lg:leading-[27px] font-open-sans">
                In an ever-changing world, luxury and self-care can feel out of
                reach, and we're here to change that. Whether it's the ultimate
                beauty transformation or the latest must-have skincare, we bring
                opportunity, excitement, and rewards to every prize draw.
              </div>
            </div>
            {/* Read more button */}
            <div className="w-full pt-6 flex justify-start items-center gap-6">
              <Link href="/about">
                <div className="px-6 py-3 overflow-hidden rounded-full border-2 border-white flex justify-start items-center gap-2">
                  <div className="text-white text-base font-semibold leading-6 font-open-sans">
                    Read more
                  </div>
                  <div className="w-6 h-6 relative overflow-hidden">
                    <div className="w-4 h-3 left-1 top-1.5 absolute border-2 border-white" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Two Cards */}
        <div className="flex-1 w-full h-full flex flex-col justify-start items-start gap-12">
          {/* Beauty with a Cause Card */}
          <div className="w-full flex-1 p-8 bg-[#F4E8D1] rounded-3xl border border-[#E7E7E7] flex flex-col justify-center items-start gap-8">
            <div className="w-full flex flex-col justify-start items-center gap-4">
              {/* Heart Icon */}
              <div className="w-[87px] h-[84px] relative overflow-hidden flex items-center justify-center">
                <Heart className="w-14 h-12 text-[#E19841] fill-[#E19841]" />
              </div>
              <div className="w-full flex flex-col justify-start items-center gap-4">
                {/* Title */}
                <div className="w-full text-center text-[#151515] text-3xl lg:text-[47px] font-medium leading-tight lg:leading-[47px] font-sans">
                  Beauty with a Cause
                </div>
                {/* Description */}
                <div className="w-full text-center text-[#313131] text-lg lg:text-2xl font-normal leading-relaxed lg:leading-9 font-open-sans">
                  Our mission goes beyond giveaways - we are a purpose-driven
                  brand that empowers people to feel their best while giving
                  back to those in need.
                </div>
              </div>
            </div>
            {/* Read more button */}
            <div className="w-full flex justify-center items-center gap-6">
              <Link href="/about">
                <div className="px-6 py-3 overflow-hidden rounded-full border-2 border-[#151515] flex justify-center items-center gap-2">
                  <div className="text-[#151515] text-base font-semibold leading-6 font-open-sans">
                    Read more
                  </div>
                  <div className="w-6 h-6 relative overflow-hidden">
                    <div className="w-4 h-3 left-1 top-1.5 absolute border-2 border-[#151515]" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Trusted Partnerships Card */}
          <div className="w-full flex-1 p-8 bg-[#F4E8D1] rounded-3xl border border-[#E7E7E7] flex flex-col justify-center items-start gap-8">
            <div className="w-full flex flex-col justify-start items-center gap-4">
              {/* Avatar Icon */}
              <div className="w-[87px] h-[84px] relative overflow-hidden flex items-center justify-center">
                <Users className="w-16 h-16 text-[#E19841] fill-[#E19841]" />
              </div>
              <div className="w-full flex flex-col justify-start items-start gap-4">
                {/* Title */}
                <div className="w-full text-center text-[#151515] text-3xl lg:text-[47px] font-medium leading-tight lg:leading-[47px] font-sans">
                  Trusted Partnerships
                </div>
                {/* Description */}
                <div className="w-full text-center text-[#313131] text-lg lg:text-2xl font-normal leading-relaxed lg:leading-9 font-open-sans">
                  Radiance Rewards is more than just a competition—it's a
                  movement for beauty, confidence, and positive change.
                </div>
              </div>
            </div>
            {/* Read more button */}
            <div className="w-full flex justify-center items-center gap-6">
              <Link href="/about">
                <div className="px-6 py-3 overflow-hidden rounded-full border-2 border-[#151515] flex justify-center items-center gap-2">
                  <div className="text-[#151515] text-base font-semibold leading-6 font-open-sans">
                    Read more
                  </div>
                  <div className="w-6 h-6 relative overflow-hidden">
                    <div className="w-4 h-3 left-1 top-1.5 absolute border-2 border-[#151515]" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
