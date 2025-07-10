import { Alert } from "@/shared/components/ui/alert";
import { Sparkles } from "lucide-react";

const AnnouncementBanner = () => {
  return (
    <Alert className="bg-[#E19841] text-white overflow-hidden rounded-none border-none">
      <div className="animate-marquee whitespace-nowrap py-2">
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          ENTER IN ONLY 2 MINUTES
        </span>
        <Sparkles className="mx-4 inline w-[18px] md:w-[20px] lg:w-[24px] h-[18px] md:h-[20px] lg:h-[24px]" />
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          EXCHANGE PRIZES FOR CASH
        </span>
        <Sparkles className="mx-4 inline w-[18px] md:w-[20px] lg:w-[24px] h-[18px] md:h-[20px] lg:h-[24px]" />
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          100&apos;S OF PRIZES TO BE WON DAILY
        </span>
        <Sparkles className="mx-4 inline w-[18px] md:w-[20px] lg:w-[24px] h-[18px] md:h-[20px] lg:h-[24px]" />
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          ENTER IN ONLY 2 MINUTES
        </span>
      </div>
    </Alert>
  );
};

export default AnnouncementBanner;
