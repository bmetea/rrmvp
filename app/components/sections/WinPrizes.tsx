import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";

// Example prize data
const prizes = [
  // {
  //   id: "breast-augmentation",
  //   title: "Breast Augmentation",
  //   description: "£10,000 Cash Prize for Procedure & Aftercare",
  //   image: "/breast-augmentation.png",
  //   sold: 90,
  // },
  {
    id: "hair-extension",
    title: "Beauty Works Hair Extensions",
    description: "£1,000 Store Credit or £1,000 Cash Alternative",
    image: "/hair-extension.jpg",
    sold: 85,
  },
  {
    id: "1000-cash-prize",
    title: "£1,000 Cash Prize",
    description: "Win £1,000 in cash, paid directly to your bank account.",
    image: "/cash-prize.png",
    sold: 80,
  },
];

const WinPrizes = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-6">Explore our prizes</h2>
          {/* <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
              All
            </button>
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
              Cosmetic Enhancement
            </button>
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
              Haircare & Skincare
            </button>
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
              Cash
            </button>
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition">
              Instant Win
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {prizes.map((prize, idx) => (
            <Card
              key={prize.id}
              className="relative flex flex-col justify-between"
            >
              {/* Top Banner */}
              <div className="absolute top-0 left-0 w-full flex items-center bg-[#E19841] text-white text-sm font-medium px-4 py-2 rounded-t-lg z-10">
                {/* Icon */}
                <span className="mr-2">
                  {idx === 2 ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 8V12L14.5 13.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </span>
                {idx === 2 ? "Top deal" : "Ending soon"}
              </div>
              <CardHeader className="text-center pt-8 pb-0">
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={prize.image}
                    alt={prize.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-lg object-cover"
                    quality={75}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {/* Category Badge */}
                <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium rounded px-2 py-1 mb-1 self-start">
                  Cosmetic Enhancement
                </span>
                <h3 className="text-lg font-semibold mb-1 text-left">
                  {prize.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 text-left">
                  {prize.description}
                </p>
                {/* Recent Winners */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    <Image
                      src={`https://avatar.iran.liara.run/public/${prize.id}-1`}
                      alt="winner1"
                      width={24}
                      height={24}
                      className="rounded-full border-2 border-white"
                    />
                    <Image
                      src={`https://avatar.iran.liara.run/public/${prize.id}-2`}
                      alt="winner2"
                      width={24}
                      height={24}
                      className="rounded-full border-2 border-white"
                    />
                    <Image
                      src={`https://avatar.iran.liara.run/public/${prize.id}-3`}
                      alt="winner3"
                      width={24}
                      height={24}
                      className="rounded-full border-2 border-white"
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    123+ recent winners
                  </span>
                </div>
                <Progress
                  value={prize.sold}
                  className="mb-1"
                  aria-label={`${prize.sold}% of tickets sold for ${prize.title}`}
                />
                <p className="text-right text-xs text-gray-500 mb-2">
                  {prize.sold}% sold
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/prizes/${prize.id}`} className="w-full">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2">
                    {/* Cart Icon */}
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M6 6h15l-1.5 9h-13z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <circle cx="9" cy="20" r="1" fill="#fff" />
                      <circle cx="18" cy="20" r="1" fill="#fff" />
                    </svg>
                    Enter now →
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinPrizes;
