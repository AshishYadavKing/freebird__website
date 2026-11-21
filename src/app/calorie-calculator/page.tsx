import type { Metadata } from "next";
import Link from "next/link";
import { CalorieCalculator } from "@/components/CalorieCalculator";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Calorie & macro calculator", description: "Work out your daily calories to lose, maintain or gain weight, and your protein, carb and fat targets." };

export default function CaloriePage() {
  return (
    <>
      <PageHero eyebrow="Tools" title="Calorie & macro calculator">Find your daily calories for your goal, then set your carbs, protein and fat split.</PageHero>
      <section className="container-site flex flex-col gap-8 py-16">
        <CalorieCalculator />
        <Link href="/personal-training#consult" className="btn-primary self-start">Get a plan from a coach</Link>
      </section>
    </>
  );
}
