import { SITE } from "@/lib/site";

/** App Store / Google Play buttons — only real links are shown; otherwise a "coming soon" note. */
export function AppStoreButtons({ primary = "btn-primary", secondary = "btn-light" }: { primary?: string; secondary?: string }) {
  if (!SITE.appStore && !SITE.playStore) {
    return <p className="text-sm font-semibold opacity-80">The Free Bird app is coming soon to the App Store and Google Play.</p>;
  }
  return (
    <>
      {SITE.appStore && <a href={SITE.appStore} target="_blank" rel="noopener noreferrer" className={primary}>App Store</a>}
      {SITE.playStore && <a href={SITE.playStore} target="_blank" rel="noopener noreferrer" className={secondary}>Google Play</a>}
    </>
  );
}
