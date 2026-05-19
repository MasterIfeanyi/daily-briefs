"use client";

import Button from "@/components/ui/Button";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // Render a placeholder with the same size so server and client agree
  if (!mounted) {
    return (
      <div className="w-9 h-9" aria-hidden="true" />
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="other"
      size="text-xl"
      className="flex items-center justify-center p-2 transition-colors rounded-full w-9 h-9 hover:bg-muted"
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
    >
      {resolvedTheme === "light" ? (
        <FiMoon size={20} className="transition-colors text-muted-foreground hover:text-foreground" />
      ) : (
        <FiSun size={20} className="transition-colors text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  );
}