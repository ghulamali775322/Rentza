"use client";
import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    question: "What is Rentza?",
    answer:
      "Rentza is a community driven peer to peer (C2C) rental platform where people can lend and rent almost anything safely and easily.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes, Rentza is free to use in terms of transactions. We don't take any commission or service fee since all transactions are handled directly between users. However, we follow a freemium model means lenders can list up to one item per month for free, and if they want to list more, they can upgrade to a premium package.",
  },
  {
    question: "How do I rent an item?",
    answer:
      "Simply browse available items either by keyword or category and turn on the location to get items near to you, contact the owner, and finalize rental terms directly with them.",
  },
  {
    question: "What types of items can I rent?",
    answer:
      "You can rent almost anything such as vehicles, electronics, tools, furniture, fashion, and more.",
  },
  {
    question: "How do I contact the owner/Lender?",
    answer:
      "Each listing has contact details. You can message or call the owner directly to discuss terms.",
  },
  {
    question: "How do I list an item?",
    answer:
      "Click on Post Add button, fill in details about your item, upload photos, and publish — it’s that easy.",
  },
  {
    question: "Can I list multiple items?",
    answer: "Yes! You can list multiple items across multiple categories.",
  },
  {
    question: "Can I edit or delete my listing?",
    answer:
      "Yes, you can edit or delete your listing anytime from your account dashboard.",
  },
  {
    question:
      "How do I know the renter or owner/lender is authenticated and trustworthy?",
    answer:
      "Trust is the core of Rentza. We use a dual authentication system. Users can either log in with Google for instant verification or sign up with email and verify through a confirmation link. Only verified users can access the platform's core features. This ensures that every active user on our platform is authenticated and trustworthy.",
  },
  {
    question: "Why should I rent instead of buying?",
    answer:
      "Renting saves money, allows lender to monetize their idle assets, reduces clutter, and helps in promoting reusability and sustainability.",
  },
];

export default function FAQsPage() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleFAQ = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="min-h-screen py-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndexes.includes(index);

            return (
              <div
                key={index}
                onClick={() => toggleFAQ(index)}
                className={`border rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${
                  isOpen ? "border-blue-500" : "border-gray-200"
                }`}
              >
                {/* Question Row */}
                <div className="flex justify-between items-center p-5">
                  <h3 className="text-lg font-medium text-gray-800">
                    {faq.question}
                  </h3>
                  <div
                    className={`transition-transform duration-300 ${
                      isOpen
                        ? "rotate-90 text-blue-500"
                        : "rotate-0 text-gray-500"
                    }`}
                  >
                    {isOpen ? <X size={24} /> : <Plus size={24} />}
                  </div>
                </div>

                {/* Smooth Answer Section */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] p-5 pt-0" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`text-gray-600 leading-relaxed text-justify transition-opacity duration-500 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
