import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface CompetitionsProps {
  children: ReactNode;
}

const Competitions = ({ children }: CompetitionsProps) => {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-6">
            Active Competitions
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button variant="outline" size="sm">
              All
            </Button>
            <Button variant="outline" size="sm">
              Raffles
            </Button>
            <Button variant="outline" size="sm">
              Instant Win
            </Button>
            <Button variant="outline" size="sm">
              Ending Soon
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Competitions;
