// app/NoDarkMode.tsx
"use client";

import { useEffect } from "react";

export default function NoDarkMode() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return null; 
}
