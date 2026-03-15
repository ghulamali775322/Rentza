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

  const handleSuccess = (credentialResponse: any) => {
    console.log("Credential Response:", credentialResponse);

    // ✅ 3. Use the passed callbackUrl instead of hardcoding
    signIn("google", { callbackUrl: callbackUrl || "/" }); // <-- updated
  };

  const handleError = () => {
    console.error("Google login failed");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}
