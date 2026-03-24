"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserInitializer() {
  const { data: session, status } = useSession();
  const { setName, setProfilePhotoUrl } = useUser();

  useEffect(() => {
    // Only fetch when authenticated or token exists
    if (status === "loading") return;

    const fetchProfile = async () => {
      try {
        const headers: HeadersInit = {};

        if (session?.user?.email) {
          // Google login
          headers["x-google-email"] = session.user.email;
        } else {
          // Email login
          const token = localStorage.getItem("token");
          if (!token) return; // not logged in
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/user/profile`, { headers });
        if (!res.ok) return;

        const data = await res.json();

        // Update global context
        setName(data.name || "");
        setProfilePhotoUrl(
          data.profilePhotoPath ? `${API_URL}${data.profilePhotoPath}` : "",
        );
      } catch (err) {
        console.error("UserInitializer error:", err);
      }
    };

    fetchProfile();
  }, [session, status, setName, setProfilePhotoUrl]);

  return null;
}
