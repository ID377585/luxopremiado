"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const REF_COOKIE_NAME = "lp_ref";
const AFFILIATE_REGEX = /^[a-zA-Z0-9_-]{3,40}$/;

function setCookie(code: string) {
  document.cookie = `${REF_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=2592000; samesite=lax`;
}

export function AffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refFromUrl = searchParams.get("ref") ?? searchParams.get("af");
    const stored = localStorage.getItem(REF_COOKIE_NAME);

    if (refFromUrl && AFFILIATE_REGEX.test(refFromUrl)) {
      localStorage.setItem(REF_COOKIE_NAME, refFromUrl);
      setCookie(refFromUrl);
      return;
    }

    if (stored && AFFILIATE_REGEX.test(stored)) {
      setCookie(stored);
    }
  }, [searchParams]);

  return null;
}
