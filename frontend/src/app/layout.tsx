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
import { UserProvider } from "@/context/UserContext";
import UserInitializer from "@/components/UserInitializer";

// 1. ADD THIS IMPORT
import { Toaster } from "react-hot-toast"; 

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
          <UserProvider>
            <AuthProvider>
              <Providers>
                
                {/* 2. ADD THE TOASTER HERE */}
                
<Toaster 
  position="top-center" 
  toastOptions={{
    duration: 4000,
    style: {
      border: '1px solid #edf2f7',
      padding: '16px 20px',
      color: '#002f34', // Your brand text color
      fontWeight: '600',
      fontSize: '15px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderRadius: '12px',
    },
    success: {
      iconTheme: {
        primary: '#10b981', // A modern, vibrant green
        secondary: '#ffffff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444', // A crisp red
        secondary: '#ffffff',
      },
    },
  }} 
/>

                <UserInitializer />
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
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}