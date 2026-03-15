"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return; // wait for session
    if (!session) {
      // Redirect to login and include the original page in query
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, session, router, pathname]);

  if (!session) return null; // or a loader

  return <>{children}</>;
}
