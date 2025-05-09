import { Button } from "@/components/ui/button";
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
          <p className="text-gray-700">
            Three simple steps to start your Radiance Rewards journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="text-center p-6 rounded-lg bg-white shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
            </div>
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
