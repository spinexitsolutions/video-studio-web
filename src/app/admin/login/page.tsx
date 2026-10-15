import type { Metadata } from "next";
import { getSingleton } from "@/lib/db";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  const s = getSingleton("settings");
  return <LoginForm siteName={s.siteName} />;
}
