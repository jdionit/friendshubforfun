// src/app/page.tsx
"use client";

import Link from "next/link";
import { Gift } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#181A1E] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        
        {/* Gift Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00C853]/10 mb-6">
          <Gift className="h-10 w-10 text-[#00C853]" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          SportyBet Rewards
        </h1>

        {/* Description */}
        <p className="text-[#A3A3A3] mb-8 max-w-md mx-auto leading-relaxed">
           Welcome to SportyBet Rewards! Sign into your sportybet account to redeem your gift as we celebrate our customers this festive season. We appreciate your loyalty and support, and we want to give back to our valued customers. Sign in now to claim your exclusive reward and enjoy the benefits of being part of the SportyBet community. Don't miss out on this special opportunity to enhance your betting experience and make the most of your time with us.
        </p>
        
        {/* Button - CHANGED TO SPORTYBET GREEN */}
        <Link 
          href="/login"
          className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-[#00C853] px-8 font-bold text-[#0A0A0A] hover:bg-[#00b34a] transition text-lg shadow-lg"
        >
          Login to Claim Your Gift
        </Link>

      </div>
    </main>
  );
}