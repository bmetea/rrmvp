import Hero from './components/sections/Hero'
import WinPrizes from './components/sections/WinPrizes'
import HowItWorks from './components/sections/HowItWorks'
import AboutSection from './components/sections/AboutSection'

export default function Home() {
  return (
    <main>
      <Hero />
      <WinPrizes />
      <HowItWorks />
      <AboutSection />
    </main>
  )
}
