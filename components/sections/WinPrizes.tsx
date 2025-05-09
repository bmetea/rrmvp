import { ReactNode } from "react";
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{children}</div>
      </div>
    </div>
  );
};

export default WinPrizes;
