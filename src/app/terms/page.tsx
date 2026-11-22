import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Terms & conditions", description: "The terms that apply when you use the Free Bird Gym website, app and services." };

export default function Page() {
  return <LegalPage kind="terms" title="Terms & conditions" />;
}
