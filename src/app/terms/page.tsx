import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Terms & conditions" };

export default function Page() {
  return <LegalPage kind="terms" title="Terms & conditions" />;
}
