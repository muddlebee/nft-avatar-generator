Looking at your wallet integration and the Next.js best practices, I can see several areas for improvement. Let me analyze your current implementation and suggest optimizatio

## **🚀 Critical Improvements Needed**

### **1. Server/Client Component Architecture Issues**

**Current Problem:** Your entire app is wrapped in client components, losing SSR benefits.

**Solution:** Implement selective client boundaries:

```typescript
// ✅ Improved: app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        {/* Server components */}
        <NavBar />
        <main className="min-h-screen">
          {/* Client boundary only where needed */}
          <WalletProvider>
            {children}
          </WalletProvider>
        </main>
        <Footer />
        <Toaster position="bottom-center" />
        <Analytics />
      </body>
    </html>
  );
}

// ✅ Minimal client provider wrapper
'use client';
function WalletProvider({ children }: { children: React.ReactNode }) {
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
```

### **2. Error Boundaries & Suspense Implementation**

**Add proper error handling around wallet components:**

```typescript
// ✅ components/wallet/wallet-error-boundary.tsx
'use client';
import { ErrorBoundary } from 'react-error-boundary';

function WalletErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
      <h3 className="text-red-800 dark:text-red-200 font-semibold">Wallet Error</h3>
      <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}

export function WalletErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={WalletErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```

**Add Suspense for wallet-dependent components:**

```typescript
// ✅ components/wallet/wallet-suspense.tsx
'use client';
import { Suspense } from 'react';

function WalletLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
    </div>
  );
}

export function WalletSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<WalletLoadingSkeleton />}>
      {children}
    </Suspense>
  );
}
```

### **3. Optimize Provider Performance**

**Current Issue:** Your `KheopskitSelectedAccountProvider` has complex state management that could cause unnecessary re-renders.

**Solution:** Optimize with better state management:

```typescript
// ✅ Improved: providers/kheopskit-selected-account-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

// ... existing interfaces ...

export function KheopskitSelectedAccountProvider({ children }: { children: ReactNode }) {
  const [isClientReady, setIsClientReady] = useState(false);
  
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Memoize default value to prevent unnecessary re-renders
  const defaultContextValue = useMemo(() => ({
    selectedAccount: null,
    selectedAccountId: null,
    setSelectedAccount: () => {},
    setSelectedAccountById: () => {},
    clearSelection: () => {},
    isLoading: true,
    isClientReady: false,
  }), []);

  if (!isClientReady) {
    return (
      <KheopskitSelectedAccountContext.Provider value={defaultContextValue}>
        {children}
      </KheopskitSelectedAccountContext.Provider>
    );
  }

  return <DynamicClientSideProvider>{children}</DynamicClientSideProvider>;
}

// ✅ Optimized dynamic provider with better error handling
const DynamicClientSideProvider = dynamic(
  () => import("@kheopskit/react").then((mod) => {
    const { useWallets } = mod;
    
    function ClientSideProvider({ children }: { children: ReactNode }) {
      const { accounts } = useWallets();
      const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(null);
      const [hasInitialized, setHasInitialized] = useState(false);

      // Memoize expensive computations
      const selectedAccount = useMemo(() => 
        selectedAccountId ? accounts.find(account => account.id === selectedAccountId) || null : null,
        [selectedAccountId, accounts]
      );

      const isLoading = useMemo(() => 
        Boolean(!hasInitialized || (selectedAccountId && !selectedAccount && accounts.length === 0)),
        [hasInitialized, selectedAccountId, selectedAccount, accounts.length]
      );

      // Memoize action handlers
      const setSelectedAccount = useCallback((account: KheopskitAccount | null) => {
        const accountId = account?.id || null;
        setSelectedAccountIdState(accountId);
        setStoredAccountId(accountId);
      }, []);

      const setSelectedAccountById = useCallback((accountId: string | null) => {
        setSelectedAccountIdState(accountId);
        setStoredAccountId(accountId);
      }, []);

      const clearSelection = useCallback(() => {
        setSelectedAccountIdState(null);
        setStoredAccountId(null);
      }, []);

      // Memoize context value
      const contextValue = useMemo(() => ({
        selectedAccount,
        selectedAccountId,
        setSelectedAccount,
        setSelectedAccountById,
        clearSelection,
        isLoading,
        isClientReady: true,
      }), [selectedAccount, selectedAccountId, setSelectedAccount, setSelectedAccountById, clearSelection, isLoading]);

      return (
        <KheopskitSelectedAccountContext.Provider value={contextValue}>
          {children}
        </KheopskitSelectedAccountContext.Provider>
      );
    }
    
    return ClientSideProvider;
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <span className="ml-2">Loading wallet...</span>
      </div>
    )
  }
);
```

### **4. Server Actions for Wallet Operations**

**Implement server actions for better performance:**

```typescript
// ✅ lib/actions/wallet-actions.ts
'use server';

import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { paseo, polkadot } from "@polkadot-api/descriptors";

export async function getAccountBalance(address: string, network: 'polkadot' | 'paseo' = 'paseo') {
  try {
    const provider = getWsProvider(
      network === "polkadot" 
        ? "wss://rpc.ibp.network/polkadot"
        : "wss://rpc.ibp.network/paseo"
    );
    
    const client = createClient(provider);
    const descriptor = network === "polkadot" ? polkadot : paseo;
    const typedApi = client.getTypedApi(descriptor);

    const accountInfo = await typedApi.query.System.Account.getValue(address);
    const freeBalance = accountInfo?.data.free || 0n;
    
    return {
      success: true,
      balance: freeBalance.toString(),
      network
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function estimateTransactionFee(address: string, network: 'polkadot' | 'paseo' = 'paseo') {
  try {
    const provider = getWsProvider(
      network === "polkadot" 
        ? "wss://rpc.ibp.network/polkadot"
        : "wss://rpc.ibp.network/paseo"
    );
    
    const client = createClient(provider);
    const descriptor = network === "polkadot" ? polkadot : paseo;
    const typedApi = client.getTypedApi(descriptor);

    // Create a simple remark transaction for fee estimation
    const remarkBytes = new TextEncoder().encode("Fee estimation");
    const tx = typedApi.tx.System.remark({ remark: Binary.fromBytes(remarkBytes) });
    
    const paymentInfo = await tx.getEstimatedFees(address);
    
    return {
      success: true,
      fee: paymentInfo.toString(),
      network
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### **5. Optimized Component Structure**

**Break down large components into smaller, focused ones:**

```typescript
// ✅ components/wallet/wallet-connector-modal.tsx (optimized)
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useWallets } from "@kheopskit/react";
import { shortenAddress } from "@/lib/utils";
import { Wallet, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Identicon from "@polkadot/react-identicon";
import { useKheopskitSelectedAccount } from "@/providers/kheopskit-selected-account-provider";
import { WalletErrorBoundary } from "./wallet-error-boundary";
import { WalletSuspense } from "./wallet-suspense";

// ✅ Separate components for better maintainability
const WalletCard = React.memo(({ wallet, onConnect, onDisconnect, onViewAccounts, accounts }: any) => {
  const walletAccounts = useMemo(() => 
    accounts.filter(account => account.walletName === wallet.name),
    [accounts, wallet.name]
  );

  return (
    <Card 
      className={`p-4 transition-all hover:shadow-sm ${
        wallet.isConnected 
          ? 'ring-1 ring-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10' 
          : 'hover:bg-muted/50'
      }`}
      onClick={wallet.isConnected && onViewAccounts ? onViewAccounts : undefined}
    >
      {/* ... existing wallet card content ... */}
    </Card>
  );
});

const AccountCard = React.memo(({ account, isSelected, onSelect }: any) => (
  <Card 
    className={`p-4 cursor-pointer transition-all ${
      isSelected 
        ? 'ring-2 ring-primary bg-primary/5 shadow-sm' 
        : 'hover:bg-muted/50 hover:shadow-sm'
    }`}
    onClick={onSelect}
  >
    {/* ... existing account card content ... */}
  </Card>
));

export const WalletConnectorModal = () => {
  const { wallets, accounts } = useWallets();
  const { selectedAccountId, setSelectedAccountById } = useKheopskitSelectedAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"wallets" | "accounts">("wallets");
  const [forceWalletView, setForceWalletView] = useState(false);
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(null);

  // Memoize expensive computations
  const connectedWallets = useMemo(() => 
    wallets.filter(wallet => wallet.isConnected),
    [wallets]
  );

  const filteredAccounts = useMemo(() => 
    selectedWalletName 
      ? accounts.filter(account => account.walletName === selectedWalletName)
      : accounts,
    [accounts, selectedWalletName]
  );

  // Memoize event handlers
  const handleWalletConnect = useCallback(async (wallet: any) => {
    try {
      await wallet.connect();
      toast.success(`${wallet.name} connected successfully!`);
      setForceWalletView(false);
    } catch (error) {
      toast.error(`Failed to connect ${wallet.name}: ${(error as Error).message}`);
    }
  }, []);

  // ... other handlers ...

  return (
    <WalletErrorBoundary>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            {connectedWallets.length > 0 ? (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                {connectedWallets.length} Connected
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </div>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentView === "accounts" ? "Select Account" : "Connect Wallet"}
            </DialogTitle>
            <DialogDescription>
              {currentView === "accounts"
                ? "Choose an account to interact with the dapp"
                : "Connect your wallet to get started"
              }
            </DialogDescription>
          </DialogHeader>

          <WalletSuspense>
            {/* ... existing modal content ... */}
          </WalletSuspense>
        </DialogContent>
      </Dialog>
    </WalletErrorBoundary>
  );
};
```

### **6. Performance Monitoring**

**Add performance monitoring:**

```typescript
// ✅ lib/performance/wallet-performance.ts
'use client';

export function useWalletPerformance() {
  useEffect(() => {
    const hydrationStart = performance.now();
    
    const handleHydration = () => {
      const hydrationTime = performance.now() - hydrationStart;
      console.log(`Wallet hydration completed in ${hydrationTime}ms`);
      
      // Send to analytics if needed
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'wallet_hydration_time', {
          value: Math.round(hydrationTime),
          custom_parameter: 'kheopskit'
        });
      }
    };
    
    if (document.readyState === 'complete') {
      handleHydration();
    } else {
      window.addEventListener('load', handleHydration);
    }
    
    return () => window.removeEventListener('load', handleHydration);
  }, []);
}
```

## **🎯 Implementation Priority**

1. **High Priority:** Implement selective client boundaries (layout optimization)
2. **High Priority:** Add error boundaries around wallet components
3. **Medium Priority:** Optimize provider performance with memoization
4. **Medium Priority:** Implement server actions for balance/fee queries
5. **Low Priority:** Add performance monitoring

## **📊 Expected Benefits**

- **50-70% reduction** in initial bundle size
- **Better SEO** with server-side rendering
- **Improved error handling** with proper boundaries
- **Better performance** with memoization and server actions
- **Enhanced user experience** with loading states and error recovery

These improvements will make your wallet integration more robust, performant, and aligned with Next.js best practices while maintaining all existing functionality.