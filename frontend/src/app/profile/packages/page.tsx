"use client";

import React, { useState } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';

// --- DATA: The Plans ---
const PACKAGES = [
  { 
    id: 'free', 
    name: 'Free', 
    price: 0, 
    duration: ' month', 
    features: ['Post 1 Ad',  'Valid for 30 days'],
    color: '#A0A0A0', // Silver
    popular: false,
    isCurrent: true
  },
  { 
    id: 'gold', 
    name: 'Gold', 
    price: 1500, 
    duration: 'month', 
    features: ['Post 2 Ads ', '(1 free + 1 Gold Ad)', 'Valid for 30 days'],
    color: '#FFD700', // Gold
    popular: true,
    isCurrent: false 
  },
  { 
    id: 'premium', 
    name: 'Premium', 
    price: 3000, 
    duration: 'month', 
    features: ['Post 3 Ads', '(1 free + 2 Premium Ads)' ,'Valid for 30 days '],
    color: '#007bff', // Blue
    popular: false ,
    isCurrent: false
  }
];

export default function PackagesPage() {
  const [selectedPlan, setSelectedPlan] = useState(PACKAGES[1]); // Default to Gold

  const handleCheckout = () => {
    alert(`Proceeding to checkout with ${selectedPlan.name} Plan (PKR ${selectedPlan.price})`);
  };

  return (
    // Container: max-w-1000px, margin auto, px-5 py-10, pt-40px (approx 10 in tailwind), min-h-screen, bg-gray
    <div className="max-w-[1000px] mx-auto px-5 py-10 pt-[40px] font-['Helvetica_Neue',_Arial,_sans-serif] min-h-screen bg-[#f8f9fa]">
      
      {/* Header */}
      <div className="text-center mb-[50px]">
        {/* Title */}
        <h1 className="text-[32px] font-semibold text-[#002f34] mb-2.5">Upgrade your plan</h1>
        {/* Subtitle */}
        <p className="text-base text-[#666]">Sell faster with our premium exposure packages</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[30px] mb-[50px]">
        {PACKAGES.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          // Determine Border Color logic based on state
          let borderColorClass = '';
          if (isSelected) {
             // We use inline style for dynamic colors, but base border logic here
             borderColorClass = 'border-opacity-100'; 
          } else if (plan.isCurrent) {
             borderColorClass = 'border-[#002f34]';
          } else {
             borderColorClass = 'border-[#eee]';
          }

          return (
            <div 
              key={plan.id} 
              onClick={() => {
                if (!plan.isCurrent) setSelectedPlan(plan);
              }}
              // PlanCard Styles
              // flex-1, bg-white, rounded-xl (12px), p-30px, relative, transition-all duration-300
              className={`
                flex-1 bg-white border rounded-xl p-[30px] relative transition-all duration-300 ease-out
                ${plan.isCurrent ? 'cursor-default' : 'cursor-pointer hover:-translate-y-[5px]'}
                ${isSelected && !plan.isCurrent ? '-translate-y-[5px]' : ''}
              `}
              style={{
                // Dynamic styles that are hard to do with just utility classes
               borderColor: isSelected ? plan.color : '#eee',
    
    boxShadow: isSelected ? `0 10px 30px -10px ${plan.color}66` : '0 4px 10px rgba(0,0,0,0.05)',
              }}
            >
              {plan.popular && (
                // Badge
                <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 bg-[#002f34] text-white py-[5px] px-[15px] rounded-[20px] text-xs font-bold uppercase flex items-center gap-[5px]">
                  <FiStar /> Most Popular
                </div>
              )}
              
              {/* PlanName */}
              <h3 className="text-2xl font-semibold text-[#002f34] mb-2.5 text-left">{plan.name}</h3>
              
              {/* PlanPrice */}
              <div 
                className="text-4xl font-medium text-left mb-5"
                style={{ color: plan.color }}
              >
                PKR {plan.price} <span className="text-base text-[#888] font-medium">/ {plan.duration}</span>
              </div>

              {/* FeaturesList */}
              <ul className="list-none p-0 m-0 mb-[30px]">
                {plan.features.map((feature, idx) => (
                  // FeatureItem
                  <li key={idx} className="flex items-center gap-2.5 text-[15px] text-[#555] mb-3">
                    <FiCheck size={18} className="text-[#008000] flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>

              {/* SelectButton */}
              <button 
                className={`
                  w-full p-[15px] rounded-md text-base font-bold transition-opacity duration-200
                  ${plan.isCurrent 
                    ? 'bg-transparent text-[#555] border border-[#ccc] cursor-default pointer-events-none' 
                    : 'text-white border border-transparent cursor-pointer hover:opacity-90'
                  }
                `}
                style={{ 
                  backgroundColor: plan.isCurrent ? 'transparent' : (plan.color === '#A0A0A0' ? '#555' : plan.color) 
                }}
              >
                {plan.isCurrent ? 'Your current plan' : (selectedPlan.id === plan.id ? 'Selected' : 'Choose Plan')}
              </button>
            </div>
          );
        })}
      </div>

      {/* SummaryBox: bg-white, border-ddd, rounded-8px, p-30px, flex, justify-between, items-center, shadow */}
      <div className="bg-white border border-[#ddd] rounded-lg p-[30px] flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)] max-md:flex-col max-md:gap-5 max-md:text-center">
        {/* SummaryText */}
        <div>
          <h3 className="text-xl font-bold text-[#002f34] mb-[5px]">Selected: {selectedPlan.name} Package</h3>
          <p className="text-[#666]">Total to pay: <strong>PKR {selectedPlan.price}</strong></p>
        </div>
        
        {/* CheckoutButton */}
        <button 
          onClick={handleCheckout}
          className="py-[15px] px-[40px] bg-[#002f34] text-white text-lg font-bold border-none rounded-md cursor-pointer hover:bg-[#004d55]"
        >
          Proceed to Pay
        </button>
      </div>

    </div>
  );
}