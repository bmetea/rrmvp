import { Alert } from "@/shared/components/ui/alert";

const AnnouncementBanner = () => {
  return (
    <Alert className="bg-[#E19841] text-white overflow-hidden rounded-none border-none">
      <div className="animate-marquee whitespace-nowrap py-2">
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          ENTER IN ONLY 2 MINUTES
        </span>
        <span className="mx-4 text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          •
        </span>
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          EXCHANGE PRIZES FOR CASH
        </span>
        <span className="mx-4 text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          •
        </span>
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          100&apos;S OF PRIZES TO BE WON DAILY
        </span>
        <span className="mx-4 text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          •
        </span>
        <span className="mx-4 font-normal text-[18px] md:text-[20px] lg:text-[24px] leading-[1.5em] font-open-sans">
          ENTER IN ONLY 2 MINUTES
        </span>
      </div>
    </Alert>
  );
};

export default AnnouncementBanner;
