"use client";

import { useEffect } from "react";

const LANDING_PATH = "/r/luxo-premiado#inicio";
const RESET_PASSWORD_PATH = "/reset-senha";

function hasRecoveryHash(hash: string): boolean {
  if (!hash.startsWith("#")) {
    return false;
  }

  const params = new URLSearchParams(hash.slice(1));
  return params.get("type") === "recovery" || Boolean(params.get("access_token"));
}

export function HomeRedirect() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);

    if (hasRecoveryHash(currentUrl.hash)) {
      window.location.replace(`${RESET_PASSWORD_PATH}${currentUrl.hash}`);
      return;
    }

    if (currentUrl.searchParams.has("code")) {
      window.location.replace(`/auth/callback${currentUrl.search}`);
      return;
    }

    window.location.replace(LANDING_PATH);
  }, []);

  return null;
}
