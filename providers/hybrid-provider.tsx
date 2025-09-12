"use client";

import { KheopskitClientProvider } from "./kheopskit-client-provider";
import { ThemeProvider } from "./theme-provider";

export function HybridProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light">
      <KheopskitClientProvider>
        {children}
      </KheopskitClientProvider>
    </ThemeProvider>
  );
}

