import type { Metadata } from "next";
import Link from "next/link";
import { CalorieCalculator } from "@/components/CalorieCalculator";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Calorie calculator", description: "Work out how many calories you need to maintain, lose or gain weight." };

export default function CaloriePage() {
  return (
    <>
      <PageHero eyebrow="Tools" title="Calorie calculator">Find your daily calorie target in seconds.</PageHero>
      <section className="container-site flex flex-col gap-8 py-16">
        <CalorieCalculator />
        <Link href="/personal-training#consult" className="btn-primary self-start">Get a plan from a coach</Link>
      </section>
    </>
  );
}
