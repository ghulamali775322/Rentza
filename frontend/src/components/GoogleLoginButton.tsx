"use client";

import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { signIn } from "next-auth/react";

// ✅ 1. Add props interface for callbackUrl
interface GoogleLoginButtonProps {
  callbackUrl?: string; // <-- new line
}

// ✅ 2. Accept props in component
export default function GoogleLoginButton({
  callbackUrl,
}: GoogleLoginButtonProps) {
  // <-- updated
  useEffect(() => {
    console.log("GoogleLoginButton mounted");
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    console.log("Credential Response:", credentialResponse);

    const token = credentialResponse.credential; // Google ID token

    // 1️⃣ Call backend to store user
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    // 2️⃣ Sign in via NextAuth for session management
    signIn("google", { callbackUrl: callbackUrl || "/" });
  };

  const handleError = () => {
    console.error("Google login failed");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}
