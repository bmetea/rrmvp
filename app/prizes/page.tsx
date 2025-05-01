import Navbar from '../components/navigation/Navbar'
import AnnouncementBanner from '../components/sections/AnnouncementBanner'
import WinPrizes from '../components/sections/WinPrizes'
import HowItWorks from '../components/sections/HowItWorks'
import Footer from '../components/navigation/Footer'

export default function PrizesPage() {
  return (
    <main>
      <Navbar activePath="/prizes" />
      <AnnouncementBanner />
      <WinPrizes />
      <HowItWorks />
      <Footer />
    </main>
  )
} 