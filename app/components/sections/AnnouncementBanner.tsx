import { Alert } from "@/components/ui/alert";

const AnnouncementBanner = () => {
  return (
    <Alert className="bg-[#D18A33] text-white overflow-hidden rounded-none border-none">
      <div className="animate-marquee whitespace-nowrap py-2">
        <span className="mx-4 font-medium">ENTER IN ONLY 2 MINUTES</span>
        <span className="mx-4">•</span>
        <span className="mx-4 font-medium">EXCHANGE PRIZES FOR CASH</span>
        <span className="mx-4">•</span>
        <span className="mx-4 font-medium">
          100&apos;S OF PRIZES TO BE WON DAILY
        </span>
        <span className="mx-4">•</span>
        <span className="mx-4 font-medium">ENTER IN ONLY 2 MINUTES</span>
      </div>
    </Alert>
  );
};

export default AnnouncementBanner;
