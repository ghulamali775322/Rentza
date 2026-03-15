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
    <footer className="bg-[#0f172a] text-gray-100 py-12 px-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
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
          <div className="flex space-x-4">
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
      </div>

      {/* ===== BOTTOM COPYRIGHT ===== */}
      <div className="border-t border-blue-700 mt-10 pt-6 text-center text-gray-300 text-sm">
        © {new Date().getFullYear()} Rentza. All rights reserved.
      </div>
    </footer>
  );
}
