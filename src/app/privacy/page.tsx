import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return <LegalPage kind="privacy" title="Privacy policy" />;
}
