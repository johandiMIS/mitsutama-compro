"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "./admin-api";

/**
 * Shared error handling for admin screens: a 401 means the session cookie is missing or
 * expired, so go to the login page; anything else becomes a message for the screen.
 */
export function useAdminError() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const handleError = React.useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : fallback);
    },
    [router],
  );

  return { error, setError, handleError };
}
