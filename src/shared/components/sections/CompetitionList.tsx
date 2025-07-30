import { Competition } from "@/(pages)/competitions/(server)/competition.service";
import { CompetitionCard } from "@/shared/components/ui/competition-card";

interface CompetitionListProps {
  competitions: Competition[];
  title?: string;
}

export function CompetitionList({
  competitions,
  title = "Explore Prizes",
}: CompetitionListProps) {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[42px] md:text-[52px] lg:text-[63px] font-medium leading-[1.2em] font-sans mb-6">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-16">
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
