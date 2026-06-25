"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/features/auth/authSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useState } from "react";

function GoogleSuccessContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    console.log("Google OAuth callback - Token:", token);

    if (!token) {
      console.error("No token found in URL");
      setError("No authentication token received");
      setTimeout(() => router.push(ROUTES.LOGIN), 2000);
      return;
    }

    // Function to handle Google auth success
    const handleGoogleAuth = async () => {
      try {
        // Save token to localStorage first
        localStorage.setItem("token", token);

        console.log("Token saved to localStorage, fetching user data...");

        // Fetch user data using the token
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          console.error("API Error:", errorData);
          throw new Error(errorData.message || "Failed to fetch user data");
        }

        const userData = await response.json();
        console.log("User data received:", userData);

        // Check if we have the expected data structure
        if (!userData.data) {
          console.error("Invalid response structure:", userData);
          throw new Error("Invalid user data received");
        }

        // Save to Redux
        dispatch(
          setCredentials({
            user: userData.data,
            token: token,
          }),
        );

        console.log("User authenticated successfully, redirecting...");

        // Redirect based on role
        if (userData.data.role === "admin") {
          router.push(ROUTES.ADMIN_DASHBOARD);
        } else {
          router.push(ROUTES.HOME);
        }
      } catch (error: any) {
        console.error("Failed to authenticate with Google:", error);
        setError(error.message || "Authentication failed");
        localStorage.removeItem("token");
        setTimeout(() => router.push(ROUTES.LOGIN), 3000);
      }
    };

    handleGoogleAuth();
  }, [searchParams, router, dispatch]);

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
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
