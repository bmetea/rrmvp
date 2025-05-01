import Navbar from '../navigation/Navbar'
import Footer from '../navigation/Footer'
import AnnouncementBanner from '../sections/AnnouncementBanner'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activePath="/" />
      <AnnouncementBanner />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
} 