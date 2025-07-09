import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-black text-white min-h-[300px] font-open-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex flex-col items-center">
              <Image
                src="/svg/logo-footer-white.svg"
                alt="Radiance Rewards"
                width={192}
                height={272}
                className="mb-2 w-48 h-[68px]"
                loading="lazy"
                fetchPriority="low"
              />
            </Link>
          </div>

          {/* Links */}
          <div className="flex space-x-6 mb-8 text-sm text-gray-300">
            <Link href="/terms-use" className="hover:text-white">
              Terms of use
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms and conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy policy
            </Link>
            <Link href="/acceptable-use-policy" className="hover:text-white">
              Acceptable use policy
            </Link>
          </div>

          {/* Gold divider line */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-8"></div>

          {/* Copyright */}
          <div className="text-xs text-gray-300">
            <p>© 2025 Radiance Rewards. All rights reserved.</p>
            <p className="mt-2">
              You must be over 18 to enter. If you are under 18 your ticket will
              be void and refunded. Prize descriptions and images are for
              illustration purposes only. Your prize will be as it was approved
              by Radiance at the time of purchase.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
