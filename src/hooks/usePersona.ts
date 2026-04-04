import { useState, useCallback } from "react";
import type { Persona } from "@/lib/types";

const STORAGE_KEY = "isa-ide-persona";

export function usePersona() {
  const [persona, setPersonaState] = useState<Persona | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pm" || stored === "dev" || stored === "test" || stored === "ops") {
      return stored;
    }
    return null;
  });

  const setPersona = useCallback((p: Persona) => {
    localStorage.setItem(STORAGE_KEY, p);
    setPersonaState(p);
  }, []);

  const clearPersona = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPersonaState(null);
  }, []);

  return { persona, setPersona, clearPersona };
}
