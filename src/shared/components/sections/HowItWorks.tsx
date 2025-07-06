import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Choose your Prize",
    description:
      "Find a prize you'd love to win. Select how many tickets and enter.",
  },
  {
    number: "2",
    title: "Get your ticket number",
    description:
      "Purchase a ticket from your basket to be in with a chance of winning.",
  },
  {
    number: "3",
    title: "Watch the draw LIVE",
    description:
      "Winners are selected at random in our LIVE or Automated draws.",
  },
  {
    number: "4",
    title: "Your chance to win",
    description:
      "All competitions and prizes go ahead regardless of amount sold",
  },
];

const HowItWorks = () => {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[35px] md:text-[47px] leading-[140%] md:leading-[130%] font-bold mb-4">
            How it works
          </h2>
          <p className="text-[16px] md:text-[18px] leading-[150%] text-muted-foreground">
            Four simple steps to start your Radiance Rewards journey.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {steps.map((step) => (
            <Card
              key={step.number}
              className="text-center bg-[#E19841]/5 border-[#E19841]/20"
            >
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E19841]/10 text-[#E19841] text-2xl font-bold mb-4 mx-auto">
                  {step.number}
                </div>
                <CardTitle className="text-[20px] md:text-[25px] leading-[150%] font-bold text-foreground">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] md:text-[16px] leading-[150%] text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/competitions">
            <Button
              variant="outline"
              className="border-[#E19841]/20 hover:bg-[#E19841]/5"
            >
              View all Competitions →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
