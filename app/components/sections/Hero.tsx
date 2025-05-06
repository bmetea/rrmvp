import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative bg-black text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg-optimized.jpg"
          alt="Hero background"
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
          quality={85}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Where <span className="text-[#E19841]">Beauty</span> <br />
            Meets <span className="text-[#E19841]">Opportunity</span>
          </h1>
          <p className="text-lg mb-8 text-white">
            A new way to experience beauty - win exclusive cosmetic
            enhancements, high-end skincare & haircare
          </p>
          <div className="flex space-x-4">
            <Button
              size="lg"
              className="bg-[#E19841] hover:bg-[#D18A33]"
              aria-label="Enter the beauty contest"
            >
              Enter now
            </Button>
            <Link href="/prizes">
              <Button
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-colors"
                aria-label="View available prizes"
              >
                View Prizes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
