// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Providers from "@/components/Providers";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Rentza - Rent Anything, Anytime",
  description:
    "A community-driven peer-to-peer rental platform for everything.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="beforeInteractive"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 transition-colors duration-300">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <AuthProvider>
            <Providers>
              {/* Navbar */}
              <Navbar />

              {/* Main Content */}
              <main className="pt-[136px] min-h-screen bg-gray-50 relative z-0">
                {/* Ensures page content doesn’t hug sides */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>

              {/* Footer */}
              <Footer />
            </Providers>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
