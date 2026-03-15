"use client";

import React from "react";
import { Users, Globe, Wallet, Heart, Handshake } from "lucide-react";

const AboutUs: React.FC = () => {
  return (
    <div className="px-6 py-16 md:px-20 lg:px-32 bg-gray-50 text-gray-800">
      {/* About Rentza */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">About Rentza</h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600">
          Rentza connects people who have with people who need — a smarter,
          affordable way to share and reuse everyday items within your
          community.
        </p>
      </section>

      {/* Our Mission */}
      <section className="text-center mb-20 border border-gray-200 shadow-md rounded-2xl py-10 px-6 bg-white hover:shadow-xl hover:-translate-y-2 hover:border-blue-500 transform transition-all duration-300 cursor-pointer">
        <div className="flex flex-col items-center">
          <Heart className="w-10 h-10 text-blue-600 mb-3 transition-transform duration-300 group-hover:scale-110" />
          <h2 className="text-3xl font-semibold mb-4 text-gray-900">
            Our Mission
          </h2>
        </div>
        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          We believe that sharing is caring, and that communities thrive when
          people help each other. Rentza makes it easy to access the things you
          need without the burden of ownership, while helping others earn from
          items they already own.
        </p>
      </section>

      {/* What We Stand For */}
      <section className="text-center mb-20">
        <h2 className="text-3xl font-semibold mb-10 text-gray-900">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Community */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-transparent hover:border-blue-500 hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300 cursor-pointer">
            <Users className="w-10 h-10 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">
              Building stronger neighborhoods through trust, connection, and
              mutual support. Together, we create a network of sharing that
              benefits everyone.
            </p>
          </div>

          {/* Sustainability */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-transparent hover:border-green-500 hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300 cursor-pointer">
            <Globe className="w-10 h-10 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
            <p className="text-gray-600">
              Reducing waste and environmental impact by maximizing the use of
              existing resources. Every rental is a step toward a greener
              future.
            </p>
          </div>

          {/* Affordability */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-transparent hover:border-yellow-500 hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300 cursor-pointer">
            <Wallet className="w-10 h-10 mx-auto text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Affordability</h3>
            <p className="text-gray-600">
              Making quality items accessible to everyone without the high cost
              of ownership. Save money while getting exactly what you need, when
              you need it.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="text-center">
        <h2 className="text-3xl font-semibold mb-10 text-gray-900">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* For Renters */}
          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-blue-500 transform transition-all duration-300 cursor-pointer">
            <Handshake className="w-10 h-10 mx-auto text-blue-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-4">For Renters</h3>
            <div className="text-left">
              <p className="text-gray-700 mb-4">
                Get access to what you need without the cost of ownership.
              </p>
            </div>
            <ul className="text-gray-600 text-left list-disc list-inside space-y-2 max-w-md mx-auto">
              <li>Browse items near you.</li>
              <li>Connect directly with trusted owners.</li>
              <li>Enjoy affordable rentals while reducing waste.</li>
            </ul>
          </div>

          {/* For Owners */}
          <div className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-green-500 transform transition-all duration-300 cursor-pointer">
            <Handshake className="w-10 h-10 mx-auto text-green-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-4">For Owners</h3>
            <div className="text-left">
              <p className="text-gray-700 mb-4">
                Turn your unused items into extra income with zero commission
                fees on transaction.
              </p>
            </div>
            <ul className="text-gray-600 text-left list-disc list-inside space-y-2 max-w-md mx-auto">
              <li>List your items with their detail.</li>
              <li>Share it safely with local renters.</li>
              <li>Earn money while promoting sustainability.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
