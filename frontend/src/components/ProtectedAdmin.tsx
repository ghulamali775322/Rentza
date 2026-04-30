"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

const ProtectedAdmin: React.FC<Props> = ({ children }) => {
  const { token, role, loadingAuth } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loadingAuth) return;

    // 🚫 Do nothing until BOTH values exist
    if (!token || !role) return;

    if (role !== "admin") {
      router.replace("/"); // use replace (important)
    } else {
      setReady(true);
    }
  }, [token, role, loadingAuth, router]);

  if (loadingAuth || !ready) return <div>Loading...</div>;

  return <>{children}</>;
};

export default ProtectedAdmin;
