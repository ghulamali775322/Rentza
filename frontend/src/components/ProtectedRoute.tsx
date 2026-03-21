"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [authChecked, setAuthChecked] = useState(false);
  const [hasLocalToken, setHasLocalToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setHasLocalToken(true);
    setAuthChecked(true); // ✅ mark local check done
  }, []);

  useEffect(() => {
    if (status === "loading" || !authChecked) return;

    if (!session && !hasLocalToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, session, hasLocalToken, authChecked, router, pathname]);

  // ✅ wait until everything is checked
  if (status === "loading" || !authChecked) return null;

  if (!session && !hasLocalToken) return null;

  return <>{children}</>;
}
