"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-square items-center justify-center rounded-[var(--radius-card)] bg-mist font-display text-4xl font-extrabold uppercase text-line-strong">Free Bird</div>;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-mist">
        <Image key={images[i]} src={images[i]} alt={alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="swap-in object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, n) => (
            <button key={src} type="button" onClick={() => setI(n)} aria-label={`Photo ${n + 1}`} aria-pressed={n === i}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] border-2 ${n === i ? "border-fire" : "border-line"}`}>
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
