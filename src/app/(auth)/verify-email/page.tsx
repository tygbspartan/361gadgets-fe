"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/lib/redux/features/auth/authApi";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const INPUT =
  "w-full h-11 border border-[#C9C9C9] rounded-[5px] px-3 bg-white font-inter font-normal text-sm text-black placeholder:text-[#9CA3AF] outline-none focus:border-black transition-colors";
const LABEL = "font-montserrat font-normal text-[14px] leading-tight text-black";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    }
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleVerify = async (verificationToken?: string) => {
    const tokenToUse = verificationToken || token;
    if (!tokenToUse) { setError("Verification token is required"); return; }
    setError("");
    try {
      await verifyEmail({ token: tokenToUse }).unwrap();
      setSuccess(true);
      setTimeout(() => router.push(ROUTES.LOGIN), 2000);
    } catch (err: any) {
      setError(err.data?.message || "Email verification failed. The link may be invalid or expired.");
    }
  };

  const handleResend = async () => {
    if (!email) { setError("Please enter your email address"); return; }
    setError("");
    setResendSuccess(false);
    try {
      await resendVerification({ email }).unwrap();
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.data?.message || "Failed to resend verification email");
    }
  };

  return (
    <div className="w-108.25 bg-white rounded-[5px] border-[0.5px] border-[#EDE9E9] shadow-[0px_2px_2px_0px_#0000001A] px-10 py-8.75 flex flex-col">
      {success ? (
        <>
          <h1 className="font-montserrat font-semibold text-[28px] leading-[1.3] tracking-[-0.01em] text-center text-black">
            Email Verified!
          </h1>
          <div className="mt-7.5 flex flex-col items-center gap-4 text-center">
            <Icon icon="mdi:check-circle-outline" width={52} height={52} className="text-green-500" />
            <p className="font-inter font-normal text-[16px] leading-tight text-[#000000B2]">
              Your email has been successfully verified. Redirecting you to sign in…
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
            Email Verification
          </h1>

          {/* Info box */}
          <div className="mt-7.5 rounded-[3px] border border-[#5AA3BE] bg-[#72A3FF1A] px-3.75 py-2.5">
            <p className="font-inter font-normal text-[14px] leading-[125%] text-[#000000B2]">
              We have sent a verification token to your email
              {email && <> at <strong className="text-black">{email}</strong></>}.
              {" "}Click the link to verify your account.
            </p>
          </div>

          {error && (
            <p className="mt-4 font-inter text-sm text-red-500">{error}</p>
          )}

          {resendSuccess && (
            <p className="mt-4 font-inter text-sm text-green-600">
              Verification email sent! Please check your inbox.
            </p>
          )}

          {/* Token field */}
          <div className="flex flex-col gap-1.5 mt-7.5">
            <label className={LABEL}>or Enter Verification Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter verification token"
              className={INPUT}
            />
          </div>

          {/* Verify Email button — 25px below */}
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={isVerifying || !token}
            className="mt-6.25 w-full h-11 bg-black text-white font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Resend button — 15px below */}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="mt-3.75 w-full h-11 border border-black text-black font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
            ) : (
              "Resend Verification Token"
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
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-black" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
