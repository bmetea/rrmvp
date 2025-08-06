"use client";

const SponsorshipBanner = () => {
  return (
    <div
      className="bg-[#663399] text-white p-2 text-center w-full relative z-40"
      style={{ backgroundColor: "#663399" }}
    >
      <span className="font-medium text-sm">
        This month we proudly sponsor{" "}
        <a
          href="https://www.cancerresearchuk.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:no-underline transition-all duration-200"
        >
          Cancer Research UK
        </a>{" "}
        🇬🇧
      </span>
    </div>
  );
};

export default SponsorshipBanner;
