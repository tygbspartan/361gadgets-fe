"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Mail, Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { RootState } from "@/lib/redux/store";
import confetti from "canvas-confetti";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Trigger confetti on page load
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper pb-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping" />
            <div className="relative bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-4xl font-bold mb-4">
          Thank You for Your Order! 🎉
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your order has been successfully placed and is being processed.
        </p>

        {/* Order Number */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="text-2xl font-bold text-red-600">{orderNumber}</p>
        </div>

        {/* Info Cards */}
        <div
          className={`grid grid-cols-1 ${isAuthenticated ? "md:grid-cols-2" : "max-w-md mx-auto"} gap-4 mb-8`}
        >
          {/* Email Confirmation */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-left">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Confirmation</h3>
                <p className="text-sm text-gray-600">
                  We've sent an order confirmation email with all the details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Tracking — only for logged-in users */}
          {isAuthenticated && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-left">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Your Order</h3>
                  <p className="text-sm text-gray-600">
                    You can track your order status in your orders page.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200 text-left">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
              ℹ
            </span>
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-blue-600 ">1.</span>
              <span>You'll receive an email confirmation shortly</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 ">2.</span>
              <span>We'll process your order and prepare it for shipping</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className="text-blue-600 ">3.</span>
              <span>Your order will be delivered within 2-3 business days</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated && (
            <Link href={`${ROUTES.ORDERS_HISTORY}/${orderNumber}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="h-4 w-4 mr-2" />
                View Order Details
              </Button>
            </Link>
          )}

          <Link href={ROUTES.HOME}>
            <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600 mb-2">
            Need help with your order?
          </p>
          <p className="text-sm text-gray-600">
            Contact us at{" "}
            <a
              href="mailto:support@dailydose.com"
              className="text-red-600 hover:underline"
            >
              support@dailydose.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+919860343445"
              className="text-red-600 hover:underline"
            >
              +91 98603 43445
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
