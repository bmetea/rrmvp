import { Competition } from "@/services/competitionService";
import { CompetitionCard } from "@/components/ui/competition-card";
import { Button } from "@/components/ui/button";

interface CompetitionListProps {
  competitions: Competition[];
  title?: string;
  showFilters?: boolean;
}

export function CompetitionList({
  competitions,
  title = "Active Competitions",
  showFilters = true,
}: CompetitionListProps) {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-6">
            {title}
          </h2>
          {showFilters && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button variant="outline" size="sm">
                All
              </Button>
              <Button variant="outline" size="sm">
                Ending Soon
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-8">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id.toString()}
              competition={competition}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
