"use client";

import React, { useState, useEffect } from 'react';
import { FiCheck, FiStar } from 'react-icons/fi';
import { useSession } from "next-auth/react"; 
import { useRouter } from "next/navigation";

// 1. IMPORT TOAST
import toast from "react-hot-toast";

const PACKAGES = [
  { id: 'free', name: 'Free', price: 0, duration: ' month', features: ['Post 1 Ad', 'Valid for 30 days'], color: '#A0A0A0', popular: false },
  { id: 'gold', name: 'Gold', price: 1500, duration: 'month', features: ['Post 5 Ads ', 'Valid for 30 days'], color: '#FFD700', popular: true },
  { id: 'premium', name: 'Premium', price: 3000, duration: 'month', features: ['Post 10 Ads' ,'Valid for 30 days '], color: '#007bff', popular: false }
];

export default function PackagesPage() {
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 

  const BACKEND_URL = "http://localhost:5000";

  const [selectedPlan, setSelectedPlan] = useState(PACKAGES[1]); 
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

  // --- 3. 🛡️ THE SECURE FIX: ONLY UPDATE ON REAL SUCCESS ---
  useEffect(() => {
    const checkPendingPayment = () => {
      if (typeof window === 'undefined') return;

      const search = window.location.search;
      const pendingData = localStorage.getItem('rentza_pending_payment');

      // SCENARIO 1: Safepay confirms the payment was a SUCCESS
      if (search.includes('safepay=success') && pendingData) {
        try {
          const { userId, planType, amount } = JSON.parse(pendingData);
          localStorage.removeItem('rentza_pending_payment'); // Clear memory
          
          // Only NOW do we force the backend update!
          window.location.href = `${BACKEND_URL}/api/subscriptions/payment-callback?userId=${userId}&planType=${planType}&amount=${amount}`;
        } catch (error) {
          console.error("Error reading payment data");
        }
      } 
      // SCENARIO 2: User clicked "Cancel" on Safepay
      else if (search.includes('safepay=failed') || search.includes('payment=failed')) {
        localStorage.removeItem('rentza_pending_payment'); // Clear memory
        
        // REPLACED ALERT WITH TOAST
        toast.error("Payment Cancelled.");
        window.history.replaceState(null, '', window.location.pathname);
      } 
      // SCENARIO 3: User hit the browser "Back" arrow (Aborted payment)
      else if (pendingData) {
        // Silently delete the memory so they don't get a free upgrade!
        localStorage.removeItem('rentza_pending_payment');
      }
    };

    checkPendingPayment();
  }, []);

  const handleCheckout = async () => {
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
        
        // 1. 🕵️‍♀️ Extract the secret Safepay tracker token from the URL
        const urlParams = new URLSearchParams(data.gatewayUrl.split('?')[1]);
        const trackerToken = urlParams.get('beacon');

        // 2. 🪟 Open Safepay in a NEW TAB so this website stays open to check the status!
        window.open(data.gatewayUrl, '_blank');

        // 3. ⏱️ Start the Polling Loop (Ask the backend every 3 seconds)
        console.log("⏱️ Polling started... waiting for user to pay in the other tab.");
        
        const checkInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${BACKEND_URL}/api/subscriptions/check-status?trackerToken=${trackerToken}&userId=${currentUserId}&planType=${selectedPlan.id}`);
            const statusData = await statusRes.json();

            if (statusData.status === "SUCCESS") {
              clearInterval(checkInterval); // Stop asking
              setIsProcessing(false);
              alert("✅ Payment Successful! Your account has been upgraded.");
              window.location.href = "/?payment=success"; // Send them to the Home Page
            }
          } catch (e) {
            console.error("Polling check failed", e);
          }
        }, 3000); // 3000 milliseconds = 3 seconds

      } else {
        // REPLACED ALERT WITH TOAST
        toast.error(data.message || "Failed to initiate payment.");
        setIsProcessing(false);
      }
    } catch (err) {
      // REPLACED ALERT WITH TOAST
      toast.error("Payment connection failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!currentUserId) {
    return <div className="text-center mt-20 text-xl font-bold">Loading Packages...</div>;
  }

  return (
   <div className="max-w-[1000px] mx-auto px-4 md:px-5 pb-28 md:pb-10 pt-[80px] md:pt-[40px] font-['Helvetica_Neue',_Arial,_sans-serif] min-h-screen bg-[#f8f9fa]">
      <div className="text-center mb-[60px]">
        <h1 className="text-[36px] font-extrabold text-[#002f34] mb-3 tracking-tight">Upgrade your plan</h1>
        <p className="text-lg text-[#666] font-medium">Sell faster with our premium exposure packages</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[30px] mb-[60px] items-center">
        {PACKAGES.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const isFreePlan = plan.id === 'free';
          const isCurrentPlan = plan.id === currentDbPlan;
          const isRenewing = isCurrentPlan && !isFreePlan;

          let buttonText = 'Choose Plan';
          if (isFreePlan) {
            buttonText = isCurrentPlan ? 'Your current plan' : 'Available next month';
          } else if (isRenewing) {
            buttonText = isSelected ? 'Selected' : 'Renew Plan';
          } else if (isSelected) {
            buttonText = 'Selected';
          }

          // Dynamic Checkmark Colors
          let checkColor = "text-[#008000]"; 
          if (plan.id === 'gold') checkColor = "text-[#FFD700]";
          if (plan.id === 'premium') checkColor = "text-[#007bff]";

          return (
            <div 
              key={plan.id} 
              onClick={() => { if (!isFreePlan) setSelectedPlan(plan); }}
              className={`flex-1 bg-white border rounded-2xl p-6 md:p-[35px] relative transition-all duration-300 ease-out 
                ${isFreePlan ? 'cursor-default opacity-90' : 'cursor-pointer hover:-translate-y-[2px] md:hover:-translate-y-[5px]'} 
                ${isSelected && !isFreePlan ? 'md:scale-105 z-10 border-2' : 'scale-100 z-0'}`}
              style={{
                borderColor: isSelected && !isFreePlan ? plan.color : '#eaeaea',
                boxShadow: isSelected && !isFreePlan ? `0 20px 40px -10px ${plan.color}55` : '0 4px 15px rgba(0,0,0,0.03)',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-[6px] px-[20px] rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-[6px] shadow-md border-2 border-white">
                  <FiStar size={14} className="fill-white" /> Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-extrabold text-[#002f34] mb-3 text-left flex items-center gap-2">
                {plan.id === 'free' && '🍃'}
                {plan.id === 'gold' && '⭐'}
                {plan.id === 'premium' && '👑'}
                {plan.name}
              </h3>
              
              <div className="text-[42px] font-bold text-left mb-6 tracking-tight" style={{ color: plan.color }}>
                <span className="text-2xl font-medium mr-1">PKR</span>{plan.price} 
                <span className="text-base text-[#888] font-medium ml-1">/ {plan.duration}</span>
              </div>

              <ul className="list-none p-0 m-0 mb-[35px]">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[15px] font-medium text-[#444] mb-4">
                    <div className={`p-1 rounded-full bg-opacity-10 ${plan.id === 'free' ? 'bg-green-100' : plan.id === 'gold' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                      <FiCheck size={16} className={`${checkColor} flex-shrink-0`} strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full p-[16px] rounded-xl text-[16px] font-bold transition-all duration-200 
                  ${isFreePlan 
                    ? 'bg-[#f4f4f4] text-[#888] border border-[#ddd] cursor-default pointer-events-none' 
                    : 'text-white shadow-md hover:shadow-lg hover:opacity-90'}`}
                style={{ backgroundColor: isFreePlan ? '#f4f4f4' : plan.color }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-2xl p-[35px] flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] max-md:flex-col max-md:gap-5 max-md:text-center">
        <div>
          <p className="text-[#666] font-medium text-sm mb-1 uppercase tracking-wide">Order Summary</p>
          <h3 className="text-2xl font-bold text-[#002f34] mb-1 flex items-center gap-2">
            {selectedPlan.name} Package
          </h3>
          <p className="text-[#555] text-lg">Total to pay: <strong className="text-black text-xl">PKR {selectedPlan.price}</strong></p>
        </div>
        
       <button 
          onClick={handleCheckout}
          disabled={isProcessing || selectedPlan.id === 'free'}
          className={`w-full md:w-auto py-[16px] px-[45px] text-white text-lg font-bold border-none rounded-xl transition-all flex items-center justify-center gap-3 
            ${isProcessing || selectedPlan.id === 'free' 
              ? 'bg-[#ccc] cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#002f34] to-[#005a63] cursor-pointer hover:shadow-xl hover:-translate-y-1'}`}
        >
          {isProcessing ? "Processing..." : <>Proceed to Pay <span className="text-xl">➔</span></>}
        </button>
      </div>
    </div>
  );
}