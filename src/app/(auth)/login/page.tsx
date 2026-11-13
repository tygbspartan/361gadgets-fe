import type { Metadata } from "next";
import { privatePage, FORM_ROBOTS } from "@/lib/seo/metadata";
import AuthModal from "@/components/auth/AuthModal";

export const metadata: Metadata = privatePage("Log in", FORM_ROBOTS);

export default function LoginPage() {
  return <AuthModal defaultTab="signin" />;
}
