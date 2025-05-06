import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

// Example prize data
const prizes = [
  {
    id: "breast-augmentation",
    title: "Breast Augmentation",
    description: "+ £2,000 Aftercare or £15,000 Cash Alternative",
    image: "/breast-augmentation.jpg",
    sold: 90,
  },
  {
    id: "1000-cash-prize",
    title: "£1,000 Cash Prize",
    description: "Win £1,000 in cash, paid directly to your bank account.",
    image: "/cash-prize.jpg",
    sold: 80,
  },
];

export default function PrizesPage() {
  return (
    <main>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {prizes.map((prize) => (
              <Card key={prize.id}>
                <CardHeader className="text-center">
                  <div className="relative w-full h-64 mb-4">
                    <Image
                      src={prize.image}
                      alt={prize.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-lg object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-semibold mb-2">{prize.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {prize.description}
                  </p>
                  <Progress value={prize.sold} className="mb-2" />
                  <p className="text-right text-sm text-gray-500">
                    {prize.sold}% sold
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/prizes/${prize.id}`} className="w-full">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Enter now →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
