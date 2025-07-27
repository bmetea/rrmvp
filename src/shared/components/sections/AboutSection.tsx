import { Heart, Users } from "lucide-react";

const AboutSection = () => {
  return (
    <div className="w-full bg-[#F7F7F7] overflow-hidden px-4 py-16 lg:px-16 lg:py-20 flex flex-col justify-start items-center gap-20">
      <div className="w-full max-w-[1400px] relative overflow-hidden flex flex-col lg:flex-row justify-start items-stretch gap-12">
        {/* Main About Us Card - Black */}
        <div className="w-full lg:w-[720px] px-12 py-16 lg:py-22 bg-[#151515] overflow-hidden rounded-3xl flex flex-col justify-start items-center gap-8">
          <div className="w-full max-w-[560px] flex flex-col justify-start items-start gap-6">
            <div className="w-full flex flex-col justify-start items-start gap-6">
              {/* Title */}
              <div className="w-full text-white text-[42px] md:text-[52px] lg:text-[63px] font-medium leading-[1.2em] font-sans">
                About us
              </div>
              {/* Highlighted subtitle */}
              <div className="w-full text-[#E19841] text-[18px] md:text-[20px] lg:text-[24px] font-normal leading-[1.5em] font-open-sans">
                At Radiance Rewards, we believe that everyone deserves the
                chance to feel confident, empowered, and beautiful—without the
                barriers of high costs.
              </div>
              {/* Body text */}
              <div className="w-full text-white text-[16px] md:text-[17px] lg:text-[18px] font-normal leading-[1.5em] font-open-sans">
                That's why we've created a fun and exciting way to win
                life-changing cosmetic procedures and premium beauty products at
                a fraction of their usual price.
              </div>
              <div className="w-full text-white text-[16px] md:text-[17px] lg:text-[18px] font-normal leading-[1.5em] font-open-sans">
                In an ever-changing world, luxury and self-care can feel out of
                reach, and we're here to change that. Whether it's the ultimate
                beauty transformation or the latest must-have skincare, we bring
                opportunity, excitement, and rewards to every prize draw.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Two Cards */}
        <div className="flex-1 w-full h-full flex flex-col justify-start items-start gap-12">
          {/* Beauty with a Cause Card */}
          <div className="w-full flex-1 p-8 bg-white rounded-3xl border border-[#E7E7E7] flex flex-col justify-center items-start gap-8">
            <div className="w-full flex flex-col justify-start items-center gap-4">
              {/* Heart Icon */}
              <div className="w-[80px] h-[80px] relative overflow-hidden flex items-center justify-center">
                <Heart className="w-12 h-12 md:w-14 md:h-14 text-[#E19841] fill-[#E19841]" />
              </div>
              <div className="w-full flex flex-col justify-start items-center gap-4">
                {/* Title */}
                <div className="w-full text-center text-[#151515] text-[24px] md:text-[28px] lg:text-[35px] font-medium leading-[1.2em] font-sans">
                  Beauty with a Cause
                </div>
                {/* Description */}
                <div className="w-full text-center text-[#313131] text-[16px] md:text-[17px] lg:text-[18px] font-normal leading-[1.5em] font-open-sans">
                  Our mission goes beyond giveaways - we are a purpose-driven
                  brand that empowers people to feel their best while giving
                  back to those in need.
                </div>
              </div>
            </div>
          </div>

          {/* Trusted Partnerships Card */}
          <div className="w-full flex-1 p-8 bg-white rounded-3xl border border-[#E7E7E7] flex flex-col justify-center items-start gap-8">
            <div className="w-full flex flex-col justify-start items-center gap-4">
              {/* Users Icon */}
              <div className="w-[80px] h-[80px] relative overflow-hidden flex items-center justify-center">
                <Users className="w-14 h-14 md:w-16 md:h-16 text-[#E19841] fill-[#E19841]" />
              </div>
              <div className="w-full flex flex-col justify-start items-start gap-4">
                {/* Title */}
                <div className="w-full text-center text-[#151515] text-[24px] md:text-[28px] lg:text-[35px] font-medium leading-[1.2em] font-sans">
                  Trusted Partnerships
                </div>
                {/* Description */}
                <div className="w-full text-center text-[#313131] text-[16px] md:text-[17px] lg:text-[18px] font-normal leading-[1.5em] font-open-sans">
                  Radiance Rewards is more than just a competition—it's a
                  movement for beauty, confidence, and positive change.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
