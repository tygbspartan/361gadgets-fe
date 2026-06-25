"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/lib/redux/features/auth/authApi";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { ROUTES } from "@/constants/routes";

type Tab = "signin" | "register";

const INPUT =
  "w-full h-11 border border-[#C9C9C9] rounded-[5px] px-3 bg-white font-inter font-normal text-sm text-black placeholder:text-[#9CA3AF] outline-none focus:border-black transition-colors";

const LABEL =
  "font-montserrat font-normal text-[14px] leading-tight text-black";

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
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
        required={required}
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

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function OtherOptions({ onGoogle }: { onGoogle: () => void }) {
  return (
    <>
      <p className="mt-7.5 font-montserrat font-normal text-[14px] leading-tight text-center text-[#000000B2]">
        Other sign in options
      </p>
      <div className="mt-3.75 flex justify-center">
        <button
          type="button"
          onClick={onGoogle}
          className="w-12.5 h-12.5 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-50 shadow-sm transition-colors"
        >
          <GoogleG />
        </button>
      </div>
    </>
  );
}

export default function AuthModal({ defaultTab = "signin" }: { defaultTab?: Tab }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [tab, setTab] = useState<Tab>(defaultTab);

  // ── Sign-in ────────────────────────────────────────────────────────────────
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginNeedsVerification, setLoginNeedsVerification] = useState(false);

  // ── Register ───────────────────────────────────────────────────────────────
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [reg, setReg] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const switchTab = (t: Tab) => {
    setTab(t);
    setLoginError("");
    setRegError("");
  };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginNeedsVerification(false);
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password");
      return;
    }
    try {
      const res = await login({ email: loginEmail, password: loginPassword }).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      router.push(res.data.user.role === "admin" ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME);
    } catch (err: any) {
      if (err.data?.needsVerification) {
        setLoginNeedsVerification(true);
        setLoginError(err.data?.message || "Please verify your email before logging in");
      } else {
        setLoginError(err.data?.message || "Invalid email or password");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!reg.email || !reg.password) { setRegError("Email and password are required"); return; }
    if (reg.password.length < 6) { setRegError("Password must be at least 6 characters"); return; }
    if (reg.password !== reg.confirmPassword) { setRegError("Passwords do not match"); return; }
    if (!reg.firstName.trim() || !reg.lastName.trim()) { setRegError("First and last name are required"); return; }
    if (!reg.phone.trim()) { setRegError("Phone number is required"); return; }
    try {
      await register({
        email: reg.email,
        password: reg.password,
        firstName: reg.firstName.trim(),
        lastName: reg.lastName.trim(),
        phone: reg.phone.trim(),
      }).unwrap();
      setRegSuccess(true);
      setTimeout(() => {
        router.push(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(reg.email)}`);
      }, 2000);
    } catch (err: any) {
      setRegError(err.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="w-108.25 bg-white rounded-[5px] border-[0.5px] border-[#EDE9E9] shadow-[0px_2px_2px_0px_#0000001A] px-10 py-8.75">
      {/* Title */}
      <h1 className="font-montserrat font-semibold text-[28px] leading-[1.3] tracking-[-0.01em] text-center text-black mb-7.5">
        {tab === "signin" ? "Welcome Back!" : "Create an Account"}
      </h1>

      {/* Toggle */}
      <div className="flex bg-[#EDEEEF] rounded-[10px] p-1">
        {(["signin", "register"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={`flex-1 py-2 font-montserrat font-medium text-[14px] leading-tight rounded-[9px] transition-all ${
              tab === t ? "bg-white shadow-sm text-black" : "text-[#6B7280] hover:text-black"
            }`}
          >
            {t === "signin" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      {/* ── Sign In form ────────────────────────────────────────────────────── */}
      {tab === "signin" && (
        <form onSubmit={handleLogin} className="flex flex-col mt-7.5">
          {loginError && (
            <div className="flex flex-col gap-1 mb-4">
              <p className="font-inter text-sm text-red-500">{loginError}</p>
              {loginNeedsVerification && (
                <Link href={ROUTES.VERIFY_EMAIL} className="font-inter text-sm text-red-600 underline">
                  Resend verification email
                </Link>
              )}
            </div>
          )}

          {/* Email */}
          <Field label="Email address">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Your email"
              className={INPUT}
              required
            />
          </Field>

          {/* Password — 15px below email */}
          <div className="flex flex-col gap-1.5 mt-3.75">
            <label className={LABEL}>Password</label>
            <PasswordInput value={loginPassword} onChange={setLoginPassword} />
          </div>

          {/* Forgot password — 10px below password input */}
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="self-end mt-2.5 font-montserrat font-normal text-[14px] leading-tight text-black hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>

          {/* Sign in button — 25px below forgot password */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-6.25 w-full h-11 bg-black text-white font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in"}
          </button>

          <OtherOptions onGoogle={handleGoogleAuth} />
        </form>
      )}

      {/* ── Register form ────────────────────────────────────────────────────── */}
      {tab === "register" && (
        regSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center mt-7.5">
            <Icon icon="mdi:check-circle-outline" width={48} height={48} className="text-green-500" />
            <h2 className="font-montserrat font-semibold text-[18px] text-black">Registration Successful!</h2>
            <p className="font-inter text-sm text-[#4B4B4B]">
              We've sent a verification email to <strong>{reg.email}</strong>.<br />
              Please check your inbox.
            </p>
            <p className="font-inter text-xs text-gray-400">Redirecting to verification page…</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col mt-7.5">
            {regError && <p className="font-inter text-sm text-red-500 mb-4">{regError}</p>}

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <Field label={<>First Name <span className="text-red-500">*</span></>}>
                <input type="text" value={reg.firstName} onChange={(e) => setReg({ ...reg, firstName: e.target.value })} placeholder="John" className={INPUT} required />
              </Field>
              <Field label={<>Last Name <span className="text-red-500">*</span></>}>
                <input type="text" value={reg.lastName} onChange={(e) => setReg({ ...reg, lastName: e.target.value })} placeholder="Doe" className={INPUT} required />
              </Field>
            </div>

            {/* Email — 15px */}
            <div className="flex flex-col gap-1.5 mt-3.75">
              <label className={LABEL}>Email address <span className="text-red-500">*</span></label>
              <input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} placeholder="Your email" className={INPUT} required />
            </div>

            {/* Phone — 15px */}
            <div className="flex flex-col gap-1.5 mt-3.75">
              <label className={LABEL}>Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder="9860123456" className={INPUT} required />
            </div>

            {/* Password — 15px */}
            <div className="flex flex-col gap-1.5 mt-3.75">
              <label className={LABEL}>Password <span className="text-red-500">*</span></label>
              <PasswordInput value={reg.password} onChange={(v) => setReg({ ...reg, password: v })} placeholder="Min 6 characters" required />
            </div>

            {/* Confirm Password — 15px */}
            <div className="flex flex-col gap-1.5 mt-3.75">
              <label className={LABEL}>Confirm Password <span className="text-red-500">*</span></label>
              <PasswordInput value={reg.confirmPassword} onChange={(v) => setReg({ ...reg, confirmPassword: v })} placeholder="Repeat password" required />
            </div>

            {/* Button — 25px */}
            <button
              type="submit"
              disabled={isRegistering}
              className="mt-6.25 w-full h-11 bg-black text-white font-montserrat font-semibold text-[16px] rounded-[5px] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRegistering ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : "Create Account"}
            </button>

            <OtherOptions onGoogle={handleGoogleAuth} />
          </form>
        )
      )}
    </div>
  );
}
