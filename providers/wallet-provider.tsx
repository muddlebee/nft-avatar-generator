'use client';

import { ThemeProvider } from "./theme-provider";
import { KheopskitClientProvider } from "./kheopskit-client-provider";
import { WalletErrorBoundary } from "@/components/wallet/wallet-error-boundary";
import { WalletSuspense } from "@/components/wallet/wallet-suspense";

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <KheopskitClientProvider>
          <WalletSuspense>
            {children}
          </WalletSuspense>
        </KheopskitClientProvider>
      </ThemeProvider>
    </WalletErrorBoundary>
  );
}
