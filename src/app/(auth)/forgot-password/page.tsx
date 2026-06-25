"use client";

import { useState } from "react";
import { useForgotPasswordMutation } from "@/lib/redux/features/auth/authApi";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const INPUT =
  "w-full h-11 border border-[#C9C9C9] rounded-[5px] px-3 bg-white font-inter font-normal text-sm text-black placeholder:text-[#9CA3AF] outline-none focus:border-black transition-colors";
const LABEL = "font-montserrat font-normal text-[14px] leading-tight text-black";

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address"); return; }
    try {
      await forgotPassword({ email }).unwrap();
    } catch {
      // Don't reveal if email exists — always show success
    }
    setSuccess(true);
  };

  return (
    <div className="w-108.25 bg-white rounded-[5px] border-[0.5px] border-[#EDE9E9] shadow-[0px_2px_2px_0px_#0000001A] px-10 py-8.75 flex flex-col">
      {success ? (
        /* ── Success state ── */
        <>
          <h1 className="font-montserrat font-semibold text-[28px] leading-[1.3] tracking-[-0.01em] text-center text-black">
            Check Your Email
          </h1>
          <div className="mt-7.5 flex flex-col items-center gap-4 text-center">
            <Icon icon="mdi:check-circle-outline" width={52} height={52} className="text-green-500" />
            <p className="font-inter font-normal text-[16px] leading-tight text-[#000000B2]">
              If an account exists for <strong className="text-black">{email}</strong>, a reset link has been sent. Please check your inbox and spam folder.
            </p>
          </div>
          <Link
            href={ROUTES.LOGIN}
            className="mt-7.5 w-full h-11 bg-black text-white font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            Back to Sign In
          </Link>
        </>
      ) : (
        /* ── Form state ── */
        <>
          {/* Title */}
          <h1 className="font-montserrat font-semibold text-[28px] leading-[1.3] tracking-[-0.01em] text-center text-black">
            Forgot Password?
          </h1>

          {/* Description — 30px below title */}
          <p className="mt-7.5 font-inter font-normal text-[16px] leading-tight text-justify text-[#000000B2]">
            Don&apos;t worry! It happens. Please enter the email associated with your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col mt-7.5">
            {error && (
              <p className="font-inter text-sm text-red-500 mb-4">{error}</p>
            )}

            {/* Email — 30px below description (already on mt-7.5 form) */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className={INPUT}
                required
              />
            </div>

            {/* Send Reset Link button — 25px below email */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6.25 w-full h-11 bg-black text-white font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* Remember your password — 30px below button */}
            <p className="mt-7.5 font-montserrat font-normal text-[14px] leading-tight text-center text-[#000000B2]">
              Remember your password?{" "}
              <Link
                href={ROUTES.LOGIN}
                className="font-montserrat font-normal text-[14px] leading-tight text-[#1B96CA] underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
