import { useEffect, useState } from "react";

/** Marca de tiempo que se refresca cada `intervalMs`, para textos como "Hace 5 minutos". */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
