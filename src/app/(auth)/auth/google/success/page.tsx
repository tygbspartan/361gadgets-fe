"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { isPrivileged } from "@/constants/roles";
import { useState } from "react";

// Error codes the backend puts in the fragment (#error=...).
const ERROR_MESSAGES: Record<string, string> = {
  google_failed: "Google sign-in was cancelled or failed. Please try again.",
  account_disabled: "This account has been deactivated. Please contact support.",
};

/*
 * The backend sends the browser here with the outcome in the URL fragment:
 * #token=... or #error=... (the fragment is never sent to a server, so the
 * token stays out of logs). We read it once, then wipe it from the address bar
 * and history straight away.
 */
function readGoogleResult() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  // ?token= is the old format, still accepted so a deploy where the backend
  // goes out before the frontend (or the reverse) doesn't break sign-in.
  const query = new URLSearchParams(window.location.search);
  const token = fragment.get("token") ?? query.get("token");
  const error = fragment.get("error");
  window.history.replaceState(null, "", window.location.pathname);
  return { token, error };
}

function GoogleSuccessContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  // The URL is wiped on the first read, so this must only run once (React's
  // dev mode runs effects twice).
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const { token, error: errorCode } = readGoogleResult();

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of the URL on arrival
      setError(
        (errorCode && ERROR_MESSAGES[errorCode]) || "No authentication token received",
      );
      setTimeout(() => router.push(ROUTES.LOGIN), 3000);
      return;
    }

    // Function to handle Google auth success
    const handleGoogleAuth = async () => {
      try {
        // Save token to localStorage first
        localStorage.setItem("token", token);

        // Fetch user data using the token
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          throw new Error(errorData.message || "Failed to fetch user data");
        }

        const userData = await response.json();

        // Check if we have the expected data structure
        if (!userData.data) {
          throw new Error("Invalid user data received");
        }

        // Save to Redux
        dispatch(
          setCredentials({
            user: userData.data,
            token: token,
          }),
        );

        // Redirect based on role — vendors AND superadmin reach the admin panel.
        if (isPrivileged(userData.data.role)) {
          router.push(ROUTES.ADMIN_DASHBOARD);
        } else {
          router.push(ROUTES.HOME);
        }
      } catch (error: any) {
        setError(error.message || "Authentication failed");
        localStorage.removeItem("token");
        setTimeout(() => router.push(ROUTES.LOGIN), 3000);
      }
    };

    handleGoogleAuth();
  }, [router, dispatch]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-600">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
            <p className="text-gray-600">
              Please wait while we complete your Google sign-in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
