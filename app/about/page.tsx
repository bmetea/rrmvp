import Navbar from '../components/navigation/Navbar'
import AnnouncementBanner from '../components/sections/AnnouncementBanner'
import AboutSection from '../components/sections/AboutSection'
import Footer from '../components/navigation/Footer'

export default function AboutPage() {
  return (
    <main>
      <Navbar activePath="/about" />
      <AnnouncementBanner />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <h1 className="text-4xl font-bold">About Radiance Rewards</h1>
          <p className="text-gray-600 mt-4">Find out a little more about us</p>
        </div>
      </div>
      <AboutSection />
      <Footer />
    </main>
  )
} 