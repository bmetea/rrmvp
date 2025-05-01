import { Button } from "@/components/ui/button"

const Hero = () => {
  return (
    <div className="relative bg-black text-white">
      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Where <span className="text-orange-400">Beauty</span> <br />
            Meets <span className="text-orange-400">Opportunity</span>
          </h1>
          <p className="text-lg mb-8 text-gray-200">
            A new way to experience beauty - win exclusive cosmetic
            enhancements, high-end skincare & haircare
          </p>
          <div className="flex space-x-4">
            <Button size="lg" className="bg-orange-400 hover:bg-orange-500">
              Enter now
            </Button>
            <Button 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              View Prizes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero 