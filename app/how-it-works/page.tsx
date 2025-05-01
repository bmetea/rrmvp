import Navbar from '../components/navigation/Navbar'
import AnnouncementBanner from '../components/sections/AnnouncementBanner'
import HowItWorks from '../components/sections/HowItWorks'
import Footer from '../components/navigation/Footer'

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar activePath="/how-it-works" />
      <AnnouncementBanner />
      <HowItWorks />
      <Footer />
    </main>
  )
} 