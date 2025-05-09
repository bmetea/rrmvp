import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Select your prize",
    description: "Select your prize and entries",
  },
  {
    number: "2",
    title: "Answer the question",
    description: "Answer the question correctly",
  },
  {
    number: "3",
    title: "Live Draw",
    description: "Winner announced on Live Draw",
  },
];

const HowItWorks = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground">
            Three simple steps to start your Radiance Rewards journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <Card key={step.number} className="text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-4 mx-auto">
                  {step.number}
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/prizes">
            <Button variant="outline">View all Prizes →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
