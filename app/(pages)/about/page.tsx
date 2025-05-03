import AboutSection from '@/app/components/sections/AboutSection'

export default function AboutPage() {
  return (
    <main>
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <h1 className="text-4xl font-bold">About Radiance Rewards</h1>
          <p className="text-gray-600 mt-4">Find out a little more about us</p>
        </div>
      </div>
      <AboutSection />
    </main>
  )
} 