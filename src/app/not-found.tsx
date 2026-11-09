import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex flex-col items-start gap-5 py-24">
      <p className="eyebrow">404</p>
      <h1 className="h-display text-6xl">This page flew away</h1>
      <p className="lead">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/memberships" className="btn-secondary">See memberships</Link>
      </div>
    </section>
  );
}
