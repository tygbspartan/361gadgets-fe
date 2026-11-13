import type { Metadata } from "next";
import { privatePage, FORM_ROBOTS } from "@/lib/seo/metadata";
import AuthModal from "@/components/auth/AuthModal";

export const metadata: Metadata = privatePage("Create an account", FORM_ROBOTS);

export default function RegisterPage() {
  return <AuthModal defaultTab="register" />;
}
