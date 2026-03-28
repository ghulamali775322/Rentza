"use client";

import React, { useState, useEffect } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';
import { useSession } from "next-auth/react"; 
import { useRouter } from "next/navigation";

const PACKAGES = [
  { id: 'free', name: 'Free', price: 0, duration: ' month', features: ['Post 1 Ad', 'Valid for 30 days'], color: '#A0A0A0', popular: false },
  { id: 'gold', name: 'Gold', price: 1500, duration: 'month', features: ['Post 2 Ads ', '(1 free + 1 Gold Ad)', 'Valid for 30 days'], color: '#FFD700', popular: true },
  { id: 'premium', name: 'Premium', price: 3000, duration: 'month', features: ['Post 3 Ads', '(1 free + 2 Premium Ads)' ,'Valid for 30 days '], color: '#007bff', popular: false }
];

export default function PackagesPage() {
 const { data: session, status } = useSession(); 
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 

  const BACKEND_URL = "http://localhost:5000";

  const [selectedPlan, setSelectedPlan] = useState(PACKAGES[1]); // Default to Gold
  const [currentDbPlan, setCurrentDbPlan] = useState("free");
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. FIND THE REAL LOGGED-IN USER ---
  useEffect(() => {
    const resolveUserId = async () => {
      let id = (session?.user as any)?.id || (session?.user as any)?._id;
      const localToken = localStorage.getItem("token");
      const googleEmail = session?.user?.email;

      if (!id && (localToken || googleEmail)) {
        try {
          const headers: HeadersInit = {};
          if (localToken) headers["Authorization"] = `Bearer ${localToken}`;
          else if (googleEmail) headers["x-google-email"] = googleEmail;

          const profileRes = await fetch(`${BACKEND_URL}/profile`, { headers });
          const profileData = await profileRes.json();
          id = profileData?.user?._id || profileData?.user?.id;
        } catch (e) {}
      }

      if (id) {
        setCurrentUserId(id);
      } else if (status === "unauthenticated" && !localToken) {
        router.push("/");
      }
    };

    if (status !== "loading") resolveUserId();
  }, [session, status, router]);

  // --- 2. FETCH STATUS ---
  useEffect(() => {
    const fetchStatus = async () => {
      if (!currentUserId) return; 
      try {
        const res = await fetch(`${BACKEND_URL}/api/subscriptions/status/${currentUserId}`);
        const result = await res.json();
        if (result.success) setCurrentDbPlan(result.data.planType);
      } catch (err) {}
    };
    fetchStatus();
  }, [currentUserId]);

  // --- 3. CHECK URL FOR PAYMENT SUCCESS/FAIL ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      alert("🎉 Payment Successful! Your account has been upgraded.");
      window.history.replaceState(null, '', window.location.pathname);
    } else if (paymentStatus === 'failed') {
      alert("❌ Payment Failed or Cancelled.");
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // --- 4. CHECKOUT CONNECTION ---
  const handleCheckout = async () => {
    // Extra security: Never allow checkout for Free plan!
    if (selectedPlan.id === 'free' || !currentUserId) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/subscriptions/init-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUserId, 
          planType: selectedPlan.id, 
          price: selectedPlan.price 
        })
      });
      
      const data = await res.json();

      if (data.success && data.gatewayUrl) {
        window.location.href = data.gatewayUrl; 
      } else {
        alert(`Error: ${data.message}`);
        setIsProcessing(false);
      }
    } catch (err) {
      alert("Payment connection failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!currentUserId) {
    return <div className="text-center mt-20 text-xl font-bold">Loading Packages...</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-10 pt-[40px] font-['Helvetica_Neue',_Arial,_sans-serif] min-h-screen bg-[#f8f9fa]">
      <div className="text-center mb-[50px]">
        <h1 className="text-[32px] font-semibold text-[#002f34] mb-2.5">Upgrade your plan</h1>
        <p className="text-base text-[#666]">Sell faster with our premium exposure packages</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[30px] mb-[50px]">
        {PACKAGES.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          
          // 🔥 SMART LOGIC FLAGS 🔥
          const isFreePlan = plan.id === 'free';
          const isCurrentPlan = plan.id === currentDbPlan;
          const isRenewing = isCurrentPlan && !isFreePlan;

          // Figure out exactly what the button should say!
          let buttonText = 'Choose Plan';
          if (isFreePlan) {
            buttonText = isCurrentPlan ? 'Your current plan' : 'Available next month';
          } else if (isRenewing) {
            buttonText = isSelected ? 'Selected' : 'Renew Plan';
          } else if (isSelected) {
            buttonText = 'Selected';
          }

          return (
            <div 
              key={plan.id} 
              // 🔥 FIX: You can ONLY click on Paid plans now!
              onClick={() => { if (!isFreePlan) setSelectedPlan(plan); }}
              className={`flex-1 bg-white border rounded-xl p-[30px] relative transition-all duration-300 ease-out ${isFreePlan ? 'cursor-default' : 'cursor-pointer hover:-translate-y-[5px]'} ${isSelected && !isFreePlan ? '-translate-y-[5px]' : ''}`}
              style={{
                borderColor: isSelected ? plan.color : '#eee',
                boxShadow: isSelected ? `0 10px 30px -10px ${plan.color}66` : '0 4px 10px rgba(0,0,0,0.05)',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 bg-[#002f34] text-white py-[5px] px-[15px] rounded-[20px] text-xs font-bold uppercase flex items-center gap-[5px]">
                  <FiStar /> Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-semibold text-[#002f34] mb-2.5 text-left">{plan.name}</h3>
              
              <div className="text-4xl font-medium text-left mb-5" style={{ color: plan.color }}>
                PKR {plan.price} <span className="text-base text-[#888] font-medium">/ {plan.duration}</span>
              </div>

              <ul className="list-none p-0 m-0 mb-[30px]">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[15px] text-[#555] mb-3">
                    <FiCheck size={18} className="text-[#008000] flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full p-[15px] rounded-md text-base font-bold transition-opacity duration-200 ${isFreePlan ? 'bg-transparent text-[#555] border border-[#ccc] cursor-default pointer-events-none' : 'text-white border border-transparent cursor-pointer hover:opacity-90'}`}
                style={{ backgroundColor: isFreePlan ? 'transparent' : plan.color }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#ddd] rounded-lg p-[30px] flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)] max-md:flex-col max-md:gap-5 max-md:text-center">
        <div>
          <h3 className="text-xl font-bold text-[#002f34] mb-[5px]">Selected: {selectedPlan.name} Package</h3>
          <p className="text-[#666]">Total to pay: <strong>PKR {selectedPlan.price}</strong></p>
        </div>
        
        <button 
          onClick={handleCheckout}
          disabled={isProcessing || selectedPlan.id === 'free'}
          className={`py-[15px] px-[40px] text-white text-lg font-bold border-none rounded-md transition-colors ${isProcessing || selectedPlan.id === 'free' ? 'bg-[#ccc] cursor-not-allowed' : 'bg-[#002f34] cursor-pointer hover:bg-[#004d55]'}`}
        >
          {isProcessing ? "Processing..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
}