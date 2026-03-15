"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/authApi";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid reset link");
      return;
    }

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await resetPassword({ token, newPassword: password });
      setMessage(result.message || "Password reset successful");

      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      setMessage(error.message || "Reset failed");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-[60vh] ">
      <div className="bg-white shadow-md p-6 rounded-lg w-[400px]">
        <h2 className="text-xl text-black font-bold mb-4 text-center">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            className="w-full text-black border p-2 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-[#002f34] text-white py-2 rounded">
            Reset Password
          </button>
        </form>

        {message && (
          <p className="text-center text-black mt-3 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}
