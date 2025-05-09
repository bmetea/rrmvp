import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type Prize = {
  id: string;
  title: string;
  description: string;
  image: string;
  sold: number;
};

interface WinPrizesProps {
  children: ReactNode;
}

const WinPrizes = ({ children }: WinPrizesProps) => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-6">Explore our prizes</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button variant="outline" size="sm">
              All
            </Button>
            <Button variant="outline" size="sm">
              Cosmetic Enhancement
            </Button>
            <Button variant="outline" size="sm">
              Haircare & Skincare
            </Button>
            <Button variant="outline" size="sm">
              Cash
            </Button>
            <Button variant="outline" size="sm">
              Instant Win
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{children}</div>
      </div>
    </div>
  );
};

export default WinPrizes;
