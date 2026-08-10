import { useEffect, useState } from "react";

/** Holds back rapidly changing input (search boxes) from hitting the API on every keystroke. */
export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
