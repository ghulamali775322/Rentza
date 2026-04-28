"use client";
import { usePathname } from "next/navigation";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
    if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#0f172a] text-gray-100 py-8 md:py-12 px-5 md:px-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {/* ===== ABOUT SECTION ===== */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">
            About Rentza
          </h3>
          <p className="text-sm text-gray-200 leading-relaxed">
            Rentza is Pakistan’s trusted platform for renting cars, homes,
            bikes, and more — connecting people who need and people who lend. We
            help communities share, save, and earn while promoting safe and
            transparent rental experiences.
          </p>
        </div>

        {/* ===== QUICK LINKS ===== */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2 text-gray-200 text-sm">
            <li>
              <Link href="/terms" className="hover:text-blue-300 transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-blue-300 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-blue-300 transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-blue-300 transition-colors"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* ===== SOCIAL MEDIA ===== */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">
            Join Our Community
          </h3>
          <p className="text-sm text-gray-200 mb-4">
            Stay connected with Rentza for new listings, safety tips, and
            community updates.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <a
              href="#"
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="#"
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition"
            >
              <FaInstagram size={16} />
            </a>
            <a
              href="#"
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition"
            >
              <FaTwitter size={16} />
            </a>
            <a
              href="#"
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition"
            >
              <FaLinkedinIn size={16} />
            </a>
            <a
              href="#"
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition"
            >
              <FaYoutube size={16} />
            </a>
          </div>
        </div>
       {/* ===== CONTACT / SUPPORT ===== */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">Contact Support</h3>
          <p className="text-sm text-gray-200 mb-4">
            Have a complaint or need help? Our support team is available 24/7.
          </p>
          
          {/* Clean, minimalistic Email Link */}
          <a 
            href="mailto:ghulamali5322@gmail.com?subject=Rentza%20Support%20Request" 
            className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors duration-300 w-fit mt-2"
          >
            {/* Simple Envelope Icon */}
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"></path>
            </svg>
            <span className="text-base font-medium tracking-wide">ghulamali5322@gmail.com</span>
          </a>
        </div>
      </div>

      {/* ===== BOTTOM COPYRIGHT ===== */}
      <div className="border-t border-blue-700 mt-10 pt-6 text-center text-gray-300 text-sm">
        © {new Date().getFullYear()} Rentza. All rights reserved.
      </div>
    </footer>
  );
}
