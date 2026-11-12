"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) setMounted(true); });
    return () => { active = false; };
  }, []);
  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle theme"><Sun className="w-4 h-4" /></Button>;
  }
  const isDark = (resolvedTheme || theme) === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}
