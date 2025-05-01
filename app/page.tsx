import Navbar from './components/navigation/Navbar'
import Hero from './components/sections/Hero'
import AnnouncementBanner from './components/sections/AnnouncementBanner'
import WinPrizes from './components/sections/WinPrizes'
import HowItWorks from './components/sections/HowItWorks'
import AboutSection from './components/sections/AboutSection'
import Footer from './components/navigation/Footer'

export default function Home() {
  return (
    <main>
      <Navbar activePath="/" />
      <Hero />
      <AnnouncementBanner />
      <WinPrizes />
      <HowItWorks />
      <AboutSection />
      <Footer />
    </main>
  )
}
