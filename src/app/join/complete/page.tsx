import type { Metadata } from "next";
import Link from "next/link";
import { JoinComplete } from "@/components/join/JoinComplete";

export const metadata: Metadata = { title: "Welcome to Free Bird", robots: { index: false } };

export default async function JoinCompletePage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const valid = !!ref && /^[0-9a-f-]{36}$/i.test(ref);

  return (
    <section className="container-site py-20">
      {valid ? (
        <JoinComplete refId={ref!} />
      ) : (
        <div className="flex flex-col items-start gap-5">
          <h1 className="h-display text-5xl">We couldn’t find that sign-up</h1>
          <Link href="/join" className="btn-primary">Start joining</Link>
        </div>
      )}
    </section>
  );
}
