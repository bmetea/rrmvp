import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Choose your Prize",
    description:
      "Find a prize you'd love to win. Select how many tickets and enter.",
  },
  {
    number: "2",
    title: "Get your ticket number",
    description:
      "Purchase a ticket from your basket to be in with a chance of winning.",
  },
  {
    number: "3",
    title: "Watch the draw LIVE",
    description:
      "Winners are selected at random in our LIVE or Automated draws.",
  },
  {
    number: "4",
    title: "Your chance to win",
    description:
      "All competitions and prizes go ahead regardless of amount sold",
  },
];

const HowItWorks = () => {
  return (
    <div className="relative bg-[#F7F7F7] overflow-hidden">
      <div className="px-4 py-16 lg:px-16 lg:py-28 flex flex-col justify-start items-center gap-8 lg:gap-16">
        {/* Header section */}
        <div className="w-full max-w-3xl flex flex-col justify-start items-center gap-4">
          <div className="w-full flex flex-col justify-start items-center gap-4">
            <div className="w-full text-center text-foreground text-[48px] md:text-[63px] lg:text-[84px] font-medium leading-[1.2em] font-sans">
              How it works
            </div>
            <div className="w-full text-center text-[#313131] text-[18px] md:text-[20px] lg:text-[24px] font-normal leading-[1.5em] font-open-sans">
              Four simple steps to start your Radiance Rewards journey.
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="w-full max-w-[1312px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="w-full h-auto min-h-[320px] p-8 bg-white rounded-3xl flex flex-col justify-start items-center gap-6"
            >
              <div className="w-full h-full flex flex-col justify-start items-center gap-4">
                {/* Large number */}
                <div className="w-full text-center text-foreground text-[48px] md:text-[63px] lg:text-[84px] font-medium leading-[1.2em] font-sans">
                  {step.number}
                </div>
                {/* Title */}
                <div className="w-full text-center text-foreground text-[24px] md:text-[28px] lg:text-[35px] font-medium leading-[1.2em] font-sans">
                  {step.title}
                </div>
                {/* Description */}
                <div className="w-full text-center text-[#313131] text-[16px] md:text-[17px] lg:text-[18px] font-normal leading-[1.5em] font-open-sans flex-1 flex items-start justify-center">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-start items-start gap-6">
          <Link href="/competitions">
            <div className="px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full border-2 border-accent flex justify-center items-center gap-2">
              <div className="text-[14px] font-semibold leading-[1.5em] font-open-sans">
                Enter now
              </div>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Decorative play icon on the right */}
      <div className="hidden lg:block absolute right-16 top-12 w-58 h-59 overflow-hidden">
        <div className="absolute right-0 top-0">
          <div className="relative w-[200px] h-[200px] flex flex-col items-center justify-center">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -rotate-15">
              <div className="text-[14px] font-open-sans font-semibold text-[#151515] whitespace-nowrap">
                Watch how it works
              </div>
            </div>
            <div className="w-20 h-20 bg-[#151515] rounded-full flex items-center justify-center mt-8">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
