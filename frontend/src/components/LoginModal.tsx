// components/LoginModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { IoMdArrowBack } from "react-icons/io";
import GoogleLoginButton from "./GoogleLoginButton";
import { login, signup, forgotPassword } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type ModalView =
  | "loginOptions"
  | "signupOptions"
  | "emailLogin"
  | "emailSignup_EnterEmail"
  | "emailSignup_CreatePassword"
  | "forgotPassword";

interface LoginModalProps {
  view: "login" | "signup";
  callbackUrl?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ view, callbackUrl = "/" }) => {
  // 1. Define the 'mounted' state here
  const [mounted, setMounted] = useState(false);

  const { login: authLogin } = useAuth();

  const [modalView, setModalView] = useState<ModalView>(
    view === "login" ? "loginOptions" : "signupOptions",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const isLoginFormValid = email.length > 0 && password.length > 0;
  const isSignUpPasswordFormValid =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword &&
    agreedToTerms;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Please enter your e-mail address.");
      return;
    }
    setModalView("emailSignup_CreatePassword");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await login({ email, password });

      if (res.token) {
        authLogin(res.token, res.user.name, res.user.role || "user");
        // Redirect based on role
        // After login
        if (res.user.role === "admin") {
          router.push("/admin"); // ✅ SPA navigation
        } else {
          router.push(callbackUrl || "/");
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }

    try {
      const res = await signup({
        name: email.split("@")[0], // temporary name
        email,
        password,
      });

      alert(res.message); // "Signup successful. Please verify your email."
      setModalView("loginOptions");
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await forgotPassword(email);

      alert(res.message || "Password reset link sent");

      setModalView("loginOptions");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    }
  };
  const getBackButtonDestination = (): ModalView => {
    switch (modalView) {
      case "emailLogin":
        return "loginOptions";
      case "emailSignup_EnterEmail":
        return "signupOptions";
      case "emailSignup_CreatePassword":
        return "emailSignup_EnterEmail";
      case "forgotPassword":
        return "emailLogin";
      default:
        return view === "login" ? "loginOptions" : "signupOptions";
    }
  };

  // --- TAILWIND STYLES DEFINITION ---
  const inputBase =
    "w-full p-3.5 rounded-lg border text-black text-base box-border mb-1.5 transition-all bg-[#fafafa] focus:outline-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden";
  const inputFocusState = "focus:border-[#007bff] focus:bg-white";
  const inputErrorState = "border-[#e00]";
  const inputDefaultState = "border-[#eee]";

  const submitButtonBase =
    "w-full p-3.5 rounded-md border-none text-base font-bold bg-[#002f34] text-white cursor-pointer transition hover:bg-[#004d55] disabled:bg-[#ccc] disabled:cursor-not-allowed";

  const socialButtonClass =
    "flex items-center justify-center w-full py-3 px-5 mb-4 rounded border border-[#c9cbcd] bg-white text-base font-semibold text-[#002f34] cursor-pointer transition hover:border-black hover:shadow-[0_0_0_1px_#000]";

  const renderViewContent = () => {
    switch (modalView) {
      case "loginOptions":
        return (
          <>
            <h2 className="text-2xl text-[#002f34] mb-6 font-bold text-center">
              Login into your Rentza account
            </h2>
            {/* ✅ Pass callbackUrl to GoogleLoginButton */}
            {mounted && <GoogleLoginButton callbackUrl={callbackUrl} />}

            <div className="flex items-center justify-center text-center my-4 text-black text-sm font-medium">
              OR
            </div>
            <button
              onClick={() => setModalView("emailLogin")}
              className={socialButtonClass}
              type="button"
            >
              <MdOutlineEmail className="text-[28px] mr-2 text-[#007bff]" />{" "}
              Login with Email
            </button>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setModalView("signupOptions");
              }}
              className="bg-transparent border-none text-[#007bff] no-underline font-bold text-base mt-1.5 cursor-pointer block w-full text-center hover:underline"
            >
              New to Rentza? Create an account
            </Link>
          </>
        );

      case "signupOptions":
        return (
          <>
            <h2 className="text-2xl text-[#002f34] mb-6 font-bold text-center">
              Create an
              <br /> New Rentza account
            </h2>
            {/* ✅ Pass callbackUrl to GoogleLoginButton */}
            {mounted && <GoogleLoginButton callbackUrl={callbackUrl} />}
            <div className="flex items-center justify-center text-center my-4 text-black text-sm font-medium">
              OR
            </div>
            <button
              onClick={() => setModalView("emailSignup_EnterEmail")}
              className={socialButtonClass}
              type="button"
            >
              <MdOutlineEmail className="text-[28px] mr-2 text-[#007bff]" />{" "}
              Join with Email
            </button>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setModalView("loginOptions");
              }}
              className="bg-transparent border-none text-[#007bff] no-underline font-bold text-base mt-1.5 cursor-pointer block w-full text-center hover:underline"
            >
              Already have an account? Login
            </Link>
          </>
        );

      case "emailLogin":
        return (
          <>
            <h2 className="text-2xl text-[#002f34] mb-6 font-bold text-center">
              Log in with Email
            </h2>
            <form onSubmit={handleEmailLogin} className="w-full text-left mt-4">
              <label className="text-sm font-semibold text-[#002f34] mb-1.5 block">
                Email address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} ${inputFocusState} ${emailError ? inputErrorState : inputDefaultState}`}
              />
              {emailError && (
                <p className="text-xs text-[#e00] -mt-1 mb-2.5">{emailError}</p>
              )}

              <label className="text-sm font-semibold text-[#002f34] mb-1.5 block mt-4">
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} ${inputFocusState} ${inputDefaultState}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-[42%] right-3 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] text-lg hover:text-[#333]"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalView("forgotPassword")}
                className="bg-transparent border-none p-0 text-left text-[13px] font-semibold text-[#007bff] -mt-1 mb-5 block w-full cursor-pointer hover:underline"
              >
                Forgot your password?
              </button>
              {/* ✅ Email login redirects to callbackUrl on success */}
              <button
                type="submit"
                disabled={!isLoginFormValid}
                className={submitButtonBase}
              >
                Log In
              </button>
            </form>
          </>
        );

      case "emailSignup_EnterEmail":
        return (
          <>
            <h2 className="text-2xl text-[#002f34] mb-6 font-bold text-center">
              Create account with Email
            </h2>
            <form onSubmit={handleEmailCheck} className="w-full text-left mt-4">
              <label className="text-sm font-semibold text-[#002f34] mb-1.5 block">
                Enter your email address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className={`${inputBase} ${inputFocusState} ${emailError ? inputErrorState : inputDefaultState}`}
              />
              {emailError && (
                <p className="text-xs text-[#e00] -mt-1 mb-2.5">{emailError}</p>
              )}

              <button
                type="submit"
                disabled={!email}
                className={submitButtonBase}
                style={{ marginTop: "30px" }}
              >
                Continue
              </button>

              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalView("emailLogin");
                }}
                className="bg-transparent border-none text-[#007bff] no-underline font-bold text-base mt-5 cursor-pointer block w-full text-center hover:underline"
                style={{ marginTop: "20px" }}
              >
                Already have an account? Log In
              </Link>
            </form>
          </>
        );

      case "emailSignup_CreatePassword":
        return (
          <>
            <h2 className="text-2xl text-[#002f34] mb-6 font-bold text-center">
              Create a password
            </h2>
            <form
              onSubmit={handleEmailSignup}
              className="w-full text-left mt-4"
            >
              <label className="text-sm font-semibold text-[#002f34] mb-1.5 block">
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} ${inputFocusState} ${inputDefaultState}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-[42%] right-3 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] text-lg hover:text-[#333]"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>

              <label
                className="text-sm font-semibold text-[#002f34] mb-1.5 block"
                style={{ marginTop: "15px" }}
              >
                Confirm Password
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordMatchError(false);
                  }}
                  className={`${inputBase} ${inputFocusState} ${passwordMatchError ? inputErrorState : inputDefaultState}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-[42%] right-3 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#888] text-lg hover:text-[#333]"
                >
                  {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
              {passwordMatchError && (
                <p className="text-xs text-[#e00] -mt-1 mb-2.5">
                  Passwords do not match
                </p>
              )}

              <div
                className="flex items-start mb-5 gap-2.5"
                style={{ marginTop: "20px" }}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-[13px] text-[#666] leading-snug"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-[#007bff] no-underline font-semibold hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/privacy"
                    className="text-[#007bff] no-underline font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                </label>
              </div>

              {/* ✅ Email signup redirects to callbackUrl on success */}
              <button
                type="submit"
                disabled={!isSignUpPasswordFormValid}
                className={submitButtonBase}
              >
                Create Account
              </button>

              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalView("emailLogin");
                }}
                className="bg-transparent border-none text-[#007bff] no-underline font-bold text-base mt-6 cursor-pointer block w-full text-center hover:underline"
                style={{ marginTop: "24px" }}
              >
                Already have an account? Log In
              </Link>
            </form>
          </>
        );

      case "forgotPassword":
        return (
          <>
            <h2 className="text-2xl text-[#002f34] mb-6 font-bold text-center">
              Forgot password
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-6 text-center">
              We’ll send a verification code to this email address if it matches
              an existing account
            </p>
            <form
              onSubmit={handleForgotPassword}
              className="w-full text-left mt-4"
            >
              <label className="text-sm font-semibold text-[#002f34] mb-1.5 block">
                Enter your email address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} ${inputFocusState} ${emailError ? inputErrorState : inputDefaultState}`}
              />
              {emailError && (
                <p className="text-xs text-[#e00] -mt-1 mb-2.5">{emailError}</p>
              )}

              <button
                type="submit"
                disabled={!email}
                className={submitButtonBase}
                style={{ marginTop: "40px" }}
              >
                Next
              </button>
            </form>
          </>
        );
    }
  };

  // 3. Ensure component is mounted before rendering portal
  if (!mounted) return null;
  // 4. Use createPortal to move modal to document.body (this fixes the z-index issue)
  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 flex justify-center items-center z-[9999] p-5">
      {/* ModalContainer */}
      <div className="bg-white rounded-xl w-[850px] max-w-full h-[550px] flex overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.2)] relative max-md:w-[400px] max-md:h-auto max-md:min-h-[500px]">
        {/* LEFT PANEL: BRANDING */}
        <div className="flex-1 bg-gradient-to-br from-[#002f34] to-[#004d55] p-10 flex flex-col justify-center items-start text-white relative max-md:hidden">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">
            Unlock the
            <br /> Power of Sharing
          </h1>
          <p className="text-base leading-relaxed opacity-90 mb-8">
            Rent items you need, lend items you don't. Join the community today.
          </p>
          <ul className="list-none p-0">
            <li className="mb-2.5 flex items-center text-sm before:content-['✓'] before:mr-2.5 before:text-[#007bff] before:font-bold">
              Safe & Secure{" "}
            </li>
            <li className="mb-2.5 flex items-center text-sm before:content-['✓'] before:mr-2.5 before:text-[#007bff] before:font-bold">
              Verified Users
            </li>
            <li className="mb-2.5 flex items-center text-sm before:content-['✓'] before:mr-2.5 before:text-[#007bff] before:font-bold">
              Easy Listing Process
            </li>
          </ul>
        </div>

        {/* RIGHT PANEL: FORM */}
        <div className="flex-1 p-10 flex flex-col justify-start pt-[60px] relative overflow-y-auto">
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 right-4 z-10 bg-transparent border-none cursor-pointer p-1 w-8 h-8 flex items-center justify-center text-[28px] text-[#555] leading-none hover:text-black hover:bg-[#f5f5f5] hover:rounded-full"
          >
            &times;
          </button>

          {modalView !== "loginOptions" && modalView !== "signupOptions" && (
            <button
              onClick={() => setModalView(getBackButtonDestination())}
              className="absolute top-4 left-4 z-10 bg-transparent border-none text-2xl cursor-pointer text-[#555] p-1 w-8 h-8 flex items-center justify-center leading-none hover:text-black hover:bg-[#f5f5f5] hover:rounded-full"
            >
              <IoMdArrowBack />
            </button>
          )}

          {renderViewContent()}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LoginModal;
