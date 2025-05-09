import FaqSection from "@/components/sections/FaqSection";

export default function FaqPage() {
  return (
    <main>
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <h1 className="text-4xl font-bold">FAQs</h1>
          <p className="text-gray-600 mt-4">
            Everything you need to know about Radiance Rewards
          </p>
        </div>
      </div>
      <FaqSection />
    </main>
  );
}
