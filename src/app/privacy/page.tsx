import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Privacy policy", description: "How Free Bird Gym collects, uses and protects your personal information." };

export default function Page() {
  return <LegalPage kind="privacy" title="Privacy policy" />;
}
