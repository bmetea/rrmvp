import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "1",
    title: "Choose your Prize",
    description: "Find a prize you'd love to win"
  },
  {
    number: "2",
    title: "Buy your ticket",
    description: "Purchase a ticket to be in with a chance of winning"
  },
  {
    number: "3",
    title: "Find out instantly",
    description: "Winners are selected in our AI Automated draws"
  }
]

const HowItWorks = () => {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-gray-600">
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
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline">
            View all Prizes →
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks 