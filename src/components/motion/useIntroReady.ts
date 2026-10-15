"use client";

import { useEffect, useState } from "react";

/** True once the intro preloader (if any) has finished — so hero animations play on cue. */
export function useIntroReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!(window as any).__studioIntro) {
      setReady(true);
      return;
    }
    const done = () => setReady(true);
    window.addEventListener("studio:intro-done", done);
    return () => window.removeEventListener("studio:intro-done", done);
  }, []);
  return ready;
}
