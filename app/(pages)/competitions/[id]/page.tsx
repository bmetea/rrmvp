import { fetchCompetitionPrizesServer } from "@/app/services/competitionService";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { DB, Competitions, CompetitionPrizes, Products } from "@/db/types";

type CompetitionWithPrizesAndProducts = Competitions & {
  prizes: (CompetitionPrizes & {
    product: Products;
  })[];
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompetitionPage({ params }: PageProps) {
  const { id } = await params;

  const competition = (await fetchCompetitionPrizesServer(
    id
  )) as unknown as CompetitionWithPrizesAndProducts;

  console.log(competition);

  if (!competition) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{competition.title}</CardTitle>
            <CardDescription>{competition.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Price</p>
                  <p className="text-2xl font-bold">
                    ${Number(competition.ticket_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Sold</p>
                  <p className="text-2xl font-bold">
                    {Number(competition.tickets_sold)} /{" "}
                    {Number(competition.total_tickets)}
                  </p>
                </div>
              </div>
              <Button className="w-full">Buy Tickets</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <h2 className="text-2xl font-bold">Prizes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competition.prizes.map((prize) => {
              const mediaInfo = prize.product.media_info as {
                images?: string[];
              } | null;
              return (
                <Card key={String(prize.id)}>
                  <CardHeader>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      {mediaInfo?.images?.[0] && (
                        <Image
                          src={mediaInfo.images[0]}
                          alt={prize.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <CardTitle className="mt-4">{prize.product.name}</CardTitle>
                    <CardDescription>
                      {prize.product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Prize Value</p>
                    <p className="text-xl font-bold">
                      ${Number(prize.product.market_value)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
