import { useEffect, useRef, useCallback, useState } from "react";
import { FormData } from "@/types";
import { updateQuestionnaire } from "@/lib/api";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(id: string | null, formData: FormData) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const lastSavedRef = useRef<string>("");

  const save = useCallback(
    async (data: FormData) => {
      if (!id) return;
      const serialized = JSON.stringify(data);
      if (serialized === lastSavedRef.current) return;

      setStatus("saving");
      try {
        await updateQuestionnaire(id, data);
        lastSavedRef.current = serialized;
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [id]
  );

  useEffect(() => {
    if (!id) return;
    const serialized = JSON.stringify(formData);
    if (serialized === lastSavedRef.current) return;
    if (serialized === "{}") return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => save(formData), 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [formData, id, save]);

  const markSynced = useCallback((data: FormData) => {
    lastSavedRef.current = JSON.stringify(data);
  }, []);

  return { status, markSynced };
}
