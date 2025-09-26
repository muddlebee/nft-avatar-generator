"use client";

import { KheopskitClientProvider } from "./kheopskit-client-provider";
import { KheopskitSelectedAccountProvider } from "./kheopskit-selected-account-provider";
import { ThemeProvider } from "./theme-provider";

export function HybridProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light">
      <KheopskitClientProvider>
        <KheopskitSelectedAccountProvider>
          {children}
        </KheopskitSelectedAccountProvider>
      </KheopskitClientProvider>
    </ThemeProvider>
  );
}

