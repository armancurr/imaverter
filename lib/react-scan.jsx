"use client";

import { scan } from "react-scan";
import { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    scan({
      enabled: false,
    });
  }, []);

  return <></>;
}
