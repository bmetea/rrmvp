import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

const WinPrizes = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm mb-4">
            Instant win
          </span>
          <h2 className="text-4xl font-bold mb-4">
            Win Beauty Must-Haves Instantly!
          </h2>
          <p className="text-gray-600">
            New winners every day. No questions, just rewards.
          </p>
        </div>

        <div className="max-w-sm mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="bg-orange-100 rounded-lg p-4 mb-4">
                <span className="text-orange-600 font-semibold">
                  Ends in 28 minutes
                </span>
              </div>
              <div className="relative w-full h-64 mb-4">
                <Image
                  src="/prize-image.jpg"
                  alt="Skincare Bundle"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-lg object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Skincare Bundle</h3>
              <p className="text-gray-600 text-sm mb-4">
                100% of prizes to be won. Win a prize every time. Prizes worth
                over £300
              </p>
              <Progress value={20} className="mb-2" />
              <p className="text-right text-sm text-gray-500">20% sold</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Enter now →
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WinPrizes;
