"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/lib/redux/features/auth/authApi";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const INPUT =
  "w-full h-11 border border-[#C9C9C9] rounded-[5px] px-3 bg-white font-inter font-normal text-sm text-black placeholder:text-[#9CA3AF] outline-none focus:border-black transition-colors";
const LABEL = "font-montserrat font-normal text-[14px] leading-tight text-black";

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Password"}
        className={`${INPUT} pr-10`}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors"
      >
        <Icon icon={show ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={18} height={18} />
      </button>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) { setError("Invalid reset token"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    try {
      await resetPassword({ token, newPassword }).unwrap();
      setSuccess(true);
      setTimeout(() => router.push(ROUTES.LOGIN), 3000);
    } catch (err: any) {
      setError(err.data?.message || "Failed to reset password. The link may be invalid or expired.");
    }
  };

  return (
    <div className="w-108.25 bg-white rounded-[5px] border-[0.5px] border-[#EDE9E9] shadow-[0px_2px_2px_0px_#0000001A] px-10 py-8.75 flex flex-col">
      {success ? (
        <>
          <h1 className="font-montserrat font-semibold text-[28px] leading-[1.3] tracking-[-0.01em] text-center text-black">
            Password Reset!
          </h1>
          <div className="mt-7.5 flex flex-col items-center gap-4 text-center">
            <Icon icon="mdi:check-circle-outline" width={52} height={52} className="text-green-500" />
            <p className="font-inter font-normal text-[16px] leading-tight text-[#000000B2]">
              Your password has been successfully reset. Redirecting you to sign in…
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
        <>
          {/* Title */}
          <h1 className="font-montserrat font-semibold text-[28px] leading-[1.3] tracking-[-0.01em] text-center text-black">
            Reset Password
          </h1>

          {/* Description */}
          <p className="mt-7.5 font-inter font-normal text-[16px] leading-tight text-justify text-[#000000B2]">
            Enter a new password below.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col mt-7.5">
            {error && (
              <p className="font-inter text-sm text-red-500 mb-4">{error}</p>
            )}

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className={LABEL}>New Password</label>
              <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="Min 6 characters" />
            </div>

            {/* Confirm Password — 15px below */}
            <div className="flex flex-col gap-1.5 mt-3.75">
              <label className={LABEL}>Confirm Password</label>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password" />
            </div>

            {/* Reset button — 25px below */}
            <button
              type="submit"
              disabled={isLoading || !token}
              className="mt-6.25 w-full h-11 bg-black text-white font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Resetting…</>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Remember your password — 30px below */}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-black" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
