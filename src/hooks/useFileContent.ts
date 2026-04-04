import { useEffect, useRef, useState } from "react";
import { readFileContent } from "@/lib/api";

const cache = new Map<string, string>();

export function useFileContent(filePath: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the latest request to avoid stale updates
  const activePathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setContent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Return cached result immediately
    const cached = cache.get(filePath);
    if (cached !== undefined) {
      setContent(cached);
      setError(null);
      setIsLoading(false);
      return;
    }

    activePathRef.current = filePath;
    setIsLoading(true);
    setError(null);

    readFileContent(filePath)
      .then((text) => {
        cache.set(filePath, text);
        if (activePathRef.current === filePath) {
          setContent(text);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (activePathRef.current === filePath) {
          setError(err instanceof Error ? err.message : String(err));
          setContent(null);
          setIsLoading(false);
        }
      });
  }, [filePath]);

  return { content, isLoading, error };
}
