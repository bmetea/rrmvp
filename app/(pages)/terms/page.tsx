'use client'

import Navbar from '@/app/components/navigation/Navbar'
import AnnouncementBanner from '@/app/components/sections/AnnouncementBanner'
import Footer from '@/app/components/navigation/Footer'

export default function TermsPage() {
  return (
    <main>
      <Navbar activePath="/terms" />
      <AnnouncementBanner />
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Terms of use</h1>
          <p className="text-gray-600 mb-8">Last updated: April 2024</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-bold mt-8 mb-4">PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING THIS SITE</h2>
            <p className="text-sm text-gray-600 mb-8">These terms tell you the rules for using our website www.radiancerewards.co.uk (our site).</p>

            <h3 className="font-semibold mt-6 mb-3">Who we are and how to contact us</h3>
            <p>Our site is run and operated by Radiance Ltd (&quot;We&quot;). We are registered in England and Wales under company number [number] and have our registered office at [address]. We are a limited company. Our VAT number is [number].</p>
            <p>We are a limited company.</p>
            <p>By using our site you accept these terms.</p>
            <p>By using our site, you confirm that you accept these terms of use and that you agree to comply with them. If you do not agree to these terms, you must not use our site. We recommend that you print a copy of these terms for future reference.</p>

            <h3 className="font-semibold mt-6 mb-3">There are other terms that may apply to you</h3>
            <p>These terms of use refer to the following additional terms, which also apply to your use of our site:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Our Privacy Policy. See further under How we may use your personal information.</li>
              <li>Our Cookie Policy, which sets out information about the cookies on our site.</li>
            </ul>

            <h3 className="font-semibold mt-6 mb-3">We may make changes to these terms</h3>
            <p>We amend these terms from time to time. Every time you wish to use our site, please check these terms to ensure that you understand the terms that apply at that time.</p>

            <h3 className="font-semibold mt-6 mb-3">We may make changes to our site</h3>
            <p>We may update and change our site from time to time to reflect changes to our products, services, our users&apos; needs and our business priorities.</p>

            <h3 className="font-semibold mt-6 mb-3">We may suspend or withdraw our site</h3>
            <p>Our site is made available free of charge. We do not guarantee that our site, or any content on it, will always be available or be uninterrupted. We may suspend or withdraw or restrict the availability of all or any part of our site for business and operational reasons.</p>

            <h3 className="font-semibold mt-6 mb-3">You must keep your account details safe</h3>
            <p>If you choose a password or any other piece of information as part of our security procedures, you must treat such information as confidential. You must not disclose it to any third party.</p>
            <p>We have the right to disable any user identification code or password, whether chosen by you or allocated by us, at any time, if in our reasonable opinion you have failed to comply with any of the provisions of these terms of use.</p>

            <h3 className="font-semibold mt-6 mb-3">How you may use material on our site</h3>
            <p>We are the owner or the licensee of all intellectual property rights in our site, and in the material published on it. Those works are protected by copyright laws and treaties around the world. All such rights are reserved.</p>

            <h3 className="font-semibold mt-6 mb-3">Our responsibility for loss or damage suffered by you</h3>
            <p>We do not exclude or limit in any way our liability to you where it would be unlawful to do so. This includes liability for death or personal injury caused by our negligence or the negligence of our employees, agents or subcontractors and for fraud or fraudulent misrepresentation.</p>

            <h3 className="font-semibold mt-6 mb-3">Rules about linking to our site</h3>
            <p>You may link to our home page, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it. You must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part where none exists.</p>

            <h3 className="font-semibold mt-6 mb-3">Which country&apos;s laws apply to any disputes?</h3>
            <p>These terms of use, their subject matter and their formation (and any non-contractual disputes or claims) are governed by English law. We both agree to the exclusive jurisdiction of the courts of England and Wales.</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 