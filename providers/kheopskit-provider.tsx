"use client";

import { KheopskitProvider as KheopskitProviderCore } from "@kheopskit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { kheopskitConfig } from "@/lib/config/kheopskit";
import { wagmiConfig } from "@/lib/config/wagmi";
import { useState } from "react";

export function KheopskitProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <KheopskitProviderCore config={kheopskitConfig}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </KheopskitProviderCore>
  );
}

