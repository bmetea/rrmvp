import { Heart, Users } from 'lucide-react'

const AboutSection = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* About Us */}
          <div className="bg-gray-900 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">About us</h2>
            <p className="text-gray-300 mb-4">
              At Radiance Rewards, we believe that everyone deserves the chance to feel confident,
              empowered, and beautiful—without the barriers of high costs.
            </p>
            <p className="text-gray-300">
              That&apos;s why we&apos;ve created a fair and exciting way to win life-changing cosmetic procedures and premium beauty products at a
              fraction of their usual price.
            </p>
            <p className="text-gray-300 mt-4">
              In our ever-changing world, luxury and self-care can feel out of reach, and we&apos;re here to change that. Whether it&apos;s the ultimate
              beauty transformation or the latest must-have skincare, we bring opportunity, excitement, and rewards to every prize draw.
            </p>
          </div>

          {/* Beauty with a Cause */}
          <div className="bg-orange-50 p-8 rounded-lg">
            <div className="space-y-8">
              <div>
                <div className="flex items-center mb-4">
                  <Heart className="text-orange-400 mr-2" />
                  <h3 className="text-xl font-semibold">Beauty with a Cause</h3>
                </div>
                <p className="text-gray-600">
                  Our mission goes beyond giveaways - we are a purpose-driven brand that
                  empowers people to feel their best while giving back to those in need.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Users className="text-orange-400 mr-2" />
                  <h3 className="text-xl font-semibold">Trusted Partnerships</h3>
                </div>
                <p className="text-gray-600">
                  Radiance Rewards is more than just a competition—it&apos;s a movement for beauty,
                  confidence, and positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutSection 