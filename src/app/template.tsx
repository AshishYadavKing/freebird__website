import { ScrollReveal } from "@/components/motion/ScrollReveal";

/** Re-mounts on every navigation: each page eases in, and its sections reveal on scroll. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
      {children}
      <ScrollReveal />
    </div>
  );
}
