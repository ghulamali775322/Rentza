// app/login/page.tsx
"use client"; // Required because the modal has click events

import React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const LoginModal = dynamic(() => import("../../components/LoginModal"), {
  ssr: false,
});

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // default to home

  return (
    <main>
      <div className="absolute top-0 left-0 z-[10000]">
        <LoginModal view="login" callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
