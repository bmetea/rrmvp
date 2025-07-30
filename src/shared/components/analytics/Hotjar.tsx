"use client";

import { hotjar } from "react-hotjar";
import { useEffect } from "react";

const HOTJAR_ID = "6477907";
const ENABLE_ANALYTICS = true;

export default function Hotjar() {
  useEffect(() => {
    if (ENABLE_ANALYTICS && HOTJAR_ID) {
      hotjar.initialize({
        id: parseInt(HOTJAR_ID),
        sv: 6,
      });
    }
  }, []);

  return null;
}
