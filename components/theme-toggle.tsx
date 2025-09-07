"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="theme-toggle-container">
        <div className="theme-toggle-track">
          <div className="theme-toggle-knob">
            <Sun className="theme-toggle-icon" />
          </div>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className={`theme-toggle-container ${isDark ? "dark" : "light"} animate-hover-scale`}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-knob">
          {isDark ? (
            <Moon className="theme-toggle-icon animate-fade-in" />
          ) : (
            <Sun className="theme-toggle-icon animate-fade-in" />
          )}
        </div>
      </div>
    </div>
  );
}
