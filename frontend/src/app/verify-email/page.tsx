"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/authApi";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );

  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyEmail(token);

        setStatus("success");
        setMessage(res.message || "Email verified successfully.");

        // redirect to login after 3s
        setTimeout(() => {
          router.push("/?login=true");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
        {status === "verifying" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-[#002f34]">
              Verifying Email
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Email Verified 🎉
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>

            <button
              onClick={() => router.push("/login")}
              className="mt-4 bg-[#002f34] text-white px-6 py-3 rounded-lg hover:bg-[#004d55]"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
