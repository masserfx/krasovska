import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "hala-krasovska-active-qid";

/**
 * Resolves the active questionnaire ID from URL or localStorage.
 * Persists the ID to localStorage when found in URL.
 * Redirects to the same page with ?id= if missing from URL but found in storage.
 * Returns null if no ID is available (caller decides how to handle).
 */
export function useQuestionnaireId(): string | null {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const idFromUrl = searchParams.get("id");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (idFromUrl) {
      localStorage.setItem(STORAGE_KEY, idFromUrl);
      setResolved(true);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      router.replace(`${pathname}?id=${stored}`);
    } else {
      setResolved(true);
    }
  }, [idFromUrl, pathname, router]);

  return idFromUrl;
}
