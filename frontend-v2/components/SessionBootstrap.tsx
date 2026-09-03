"use client";

import { useEffect } from "react";
import { getBrowserSessionId } from "@/lib/session";

/** Ensures every tab has a sworn_session cookie before store/API calls. */
export function SessionBootstrap() {
  useEffect(() => {
    getBrowserSessionId();
  }, []);
  return null;
}
