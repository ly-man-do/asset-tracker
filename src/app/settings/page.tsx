"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorTheme } from "@/components/providers/ThemeColorProvider";
import { COLOR_THEMES, type ColorTheme } from "@/lib/theme-colors";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { colorTheme, setColorTheme } = useColorTheme();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Light / Dark mode */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Mode</p>
            {!mounted ? (
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-md" />
                <Skeleton className="h-12 flex-1 rounded-md" />
                <Skeleton className="h-12 flex-1 rounded-md" />
              </div>
            ) : (
              <div className="flex gap-3">
                {(["light", "dark", "system"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTheme(m)}
                    className={cn(
                      "flex-1 rounded-md border-2 py-3 text-sm font-medium capitalize transition-colors",
                      theme === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Color theme */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Accent Color</p>
            <div className="grid grid-cols-6 gap-3">
              {COLOR_THEMES.map((t) => (
                <ColorSwatch
                  key={t.id}
                  theme={t}
                  selected={mounted && colorTheme === t.id}
                  onClick={() => setColorTheme(t.id as ColorTheme)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ColorSwatch({
  theme,
  selected,
  onClick,
}: {
  theme: (typeof COLOR_THEMES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={theme.label}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-md p-1.5 transition-colors",
        selected ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all"
        style={{
          background: theme.light,
          outline: selected ? `2px solid ${theme.light}` : "2px solid transparent",
          outlineOffset: "3px",
        }}
      >
        {selected && <Check className="h-4 w-4 text-white drop-shadow" />}
      </span>
      <span className={cn("text-xs", selected ? "font-semibold" : "text-muted-foreground")}>
        {theme.label}
      </span>
    </button>
  );
}
