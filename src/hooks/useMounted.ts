import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` en el servidor y durante la hidratación; `true` una vez montado en el cliente.
 * Equivale al patrón `useEffect(() => setMounted(true))` sin el render extra en cascada.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
