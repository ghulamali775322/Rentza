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
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (token && savedRole) {
      setRole(savedRole);
    }

    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (status === "loading" || !authChecked) return;

    // 🔥 DO NOT TOUCH ADMIN ROUTES
    if (pathname.startsWith("/admin")) return;

    if (!session && role !== "user") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, session, role, authChecked, router, pathname]);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  if (status === "loading" || !authChecked) return null;

  if (!session && role !== "user") return null;

  return <>{children}</>;
}