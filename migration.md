
# 🚀 **Kheopskit Integration Plan for Polkadot Next.js Starter**

## 📋 **Overview**

This document outlines the complete integration plan for migrating from Reactive-Dot to Kheopskit in the Polkadot Next.js Starter project. Kheopskit provides unified wallet management across Polkadot and Ethereum platforms with better UX and modern patterns.

## 🎯 **Goals**

- **Replace Reactive-Dot** with Kheopskit for wallet management
- **Add Ethereum support** alongside existing Polkadot functionality  
- **Implement modern wallet connector modal** (similar to MetaMask's UX)
- **Maintain existing functionality** while improving user experience
- **Add cross-platform transaction support**

---

## 📦 **Phase 1: Dependencies & Installation**

### 1.1 Install Kheopskit Packages

```bash
# Install core Kheopskit packages
pnpm add @kheopskit/core @kheopskit/react

# Install additional dependencies for Ethereum support
pnpm add wagmi viem @tanstack/react-query

# Install WalletConnect for mobile wallet support
pnpm add @reown/appkit @walletconnect/universal-provider
```

### 1.2 Remove Reactive-Dot Dependencies

```bash
# Remove Reactive-Dot packages (after migration)
pnpm remove @reactive-dot/core @reactive-dot/react
```

### 1.3 Update package.json

```json
{
  "dependencies": {
    "@kheopskit/core": "^1.0.0",
    "@kheopskit/react": "^1.0.0", 
    "wagmi": "^2.15.4",
    "viem": "^2.30.1",
    "@tanstack/react-query": "^5.76.2",
    "@reown/appkit": "^1.7.6",
    "@walletconnect/universal-provider": "^2.0.0"
  }
}
```

---

## ⚙️ **Phase 2: Configuration Setup**

### 2.1 Create Kheopskit Configuration

**File: `lib/config/kheopskit.ts`**

```typescript
import type { KheopskitConfig } from "@kheopskit/core";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { defineChain } from "@reown/appkit/networks";

// Define supported networks
export const polkadot = defineChain({
  id: "91b171bb158e2d3848fa23a9f1c25182",
  name: "Polkadot",
  nativeCurrency: { name: "Polkadot", symbol: "DOT", decimals: 10 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ibp.network/polkadot"],
      webSocket: ["wss://rpc.ibp.network/polkadot"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polkadot Explorer", 
      url: "https://polkadot.subscan.io/",
    },
  },
  chainNamespace: "polkadot",
  caipNetworkId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
});

export const polkadotAssetHub = defineChain({
  id: "68d56f15f85d3136970ec16946040bc1",
  name: "Polkadot Asset Hub",
  nativeCurrency: { name: "Polkadot", symbol: "DOT", decimals: 10 },
  rpcUrls: {
    default: {
      http: ["https://polkadot-asset-hub-rpc.polkadot.io"],
      webSocket: ["wss://polkadot-asset-hub-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polkadot Explorer",
      url: "https://assethub-polkadot.subscan.io/",
    },
  },
  chainNamespace: "polkadot",
  caipNetworkId: "polkadot:68d56f15f85d3136970ec16946040bc1",
});

export const paseo = defineChain({
  id: "67f9723393ef76214df0118c34bbbd3d", 
  name: "Paseo",
  nativeCurrency: { name: "Paseo", symbol: "PAS", decimals: 10 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ibp.network/paseo"],
      webSocket: ["wss://rpc.ibp.network/paseo"],
    },
  },
  blockExplorers: {
    default: {
      name: "Paseo Explorer",
      url: "https://paseo.subscan.io/",
    },
  },
  chainNamespace: "polkadot",
  caipNetworkId: "polkadot:67f9723393ef76214df0118c34bbbd3d",
});

// Ethereum chains
export const sepolia = defineChain({
  id: "11155111",
  name: "Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  chainNamespace: "eip155",
  caipNetworkId: "eip155:11155111",
});

export const mainnet = defineChain({
  id: "1",
  name: "Ethereum", 
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/eth"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
  chainNamespace: "eip155",
  caipNetworkId: "eip155:1",
});

// All supported networks
export const APPKIT_CHAINS: [AppKitNetwork, ...AppKitNetwork[]] = [
  polkadot,
  polkadotAssetHub, 
  paseo,
  sepolia,
  mainnet,
];

// Kheopskit configuration
export const kheopskitConfig: KheopskitConfig = {
  autoReconnect: true,
  platforms: ["polkadot", "ethereum"], // Support both platforms
  walletConnect: {
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    metadata: {
      name: "Polkadot Next.js Starter",
      description: "A starter project for your next Polkadot dApp",
      url: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      icons: ["/polkadot-nextjs-starter.png"],
    },
    networks: APPKIT_CHAINS,
  },
  debug: process.env.NODE_ENV === "development",
};
```

### 2.2 Create Wagmi Configuration

**File: `lib/config/wagmi.ts`**

```typescript
import { createConfig, http } from "wagmi";
import { APPKIT_CHAINS } from "./kheopskit";

// Filter only Ethereum chains for Wagmi
const ethereumChains = APPKIT_CHAINS.filter(network => 
  network.chainNamespace === "eip155"
);

export const wagmiConfig = createConfig({
  chains: ethereumChains,
  transports: ethereumChains.reduce(
    (acc, chain) => {
      acc[chain.id] = http();
      return acc;
    },
    {} as Record<string, ReturnType<typeof http>>
  ),
});
```

---

## 🏗️ **Phase 3: Provider Setup**

### 3.1 Create Kheopskit Provider

**File: `providers/kheopskit-provider.tsx`**

```typescript
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
```

### 3.2 Update Root Layout

**File: `app/layout.tsx`**

```typescript
import { KheopskitProvider } from "@/providers/kheopskit-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <KheopskitProvider>
          {children}
          <Toaster />
        </KheopskitProvider>
      </body>
    </html>
  );
}
```

---

## 🎨 **Phase 4: UI Components**

### 4.1 Create Wallet Connector Modal

**File: `components/wallet/wallet-connector-modal.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useWallets } from "@kheopskit/react";
import { shortenAddress } from "@/lib/utils";
import { Wallet, Check } from "lucide-react";
import { toast } from "sonner";
import { Binary } from "polkadot-api";

export const WalletConnectorModal = () => {
  const { wallets, accounts } = useWallets();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const connectedWallets = wallets.filter(wallet => wallet.isConnected);
  const hasConnectedWallets = connectedWallets.length > 0;

  const handleWalletConnect = async (wallet: any) => {
    try {
      await wallet.connect();
      toast.success(`${wallet.name} connected successfully!`);
    } catch (error) {
      toast.error(`Failed to connect ${wallet.name}: ${(error as Error).message}`);
    }
  };

  const handleWalletDisconnect = (wallet: any) => {
    wallet.disconnect();
    toast.success(`${wallet.name} disconnected`);
  };

  const handleSignMessage = async (account: any) => {
    const message = "Hello from Polkadot Next.js Starter!";
    
    try {
      if (account.platform === "polkadot") {
        const bytes = Binary.fromText(message).asBytes();
        const signature = await account.polkadotSigner.signBytes(bytes);
        const hexSignature = Binary.fromBytes(signature).asHex();
        toast.success(`Signature: ${hexSignature.slice(0, 20)}...`);
      } else if (account.platform === "ethereum") {
        const signature = await account.client.signMessage({
          message,
          account: account.address,
        });
        toast.success(`Signature: ${signature.slice(0, 20)}...`);
      }
    } catch (error) {
      toast.error(`Signing failed: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed top-4 right-4 z-40">
          {hasConnectedWallets ? (
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
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Wallet Connection</DialogTitle>
          <DialogDescription>
            Connect your wallet to interact with the dapp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Available Wallets */}
          <div>
            <h3 className="text-sm font-medium mb-2">Available Wallets</h3>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {wallet.icon && (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-6 h-6 rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {wallet.platform}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={wallet.isConnected ? "destructive" : "default"}
                      onClick={() => 
                        wallet.isConnected 
                          ? handleWalletDisconnect(wallet)
                          : handleWalletConnect(wallet)
                      }
                    >
                      {wallet.isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Connected Accounts */}
          {accounts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Connected Accounts</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {accounts.map((account) => (
                  <Card 
                    key={account.id} 
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedAccount === account.id 
                        ? 'ring-2 ring-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">
                          {account.platform === "polkadot" ? account.name : "Account"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {shortenAddress(account.address)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {account.walletName} • {account.platform}
                        </div>
                      </div>
                      {selectedAccount === account.id && (
                        <div className="text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sign Message */}
          {selectedAccount && (
            <div>
              <h3 className="text-sm font-medium mb-2">Actions</h3>
              <Button
                onClick={() => {
                  const account = accounts.find(a => a.id === selectedAccount);
                  if (account) handleSignMessage(account);
                }}
                className="w-full"
              >
                Sign Test Message
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 🔄 **Phase 5: Migration Strategy**

### 5.1 Update Existing Components

**File: `components/account/view-select-account.tsx`**

```typescript
"use client";

import { useWallets } from "@kheopskit/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shortenAddress } from "@/lib/utils";

export function ViewSelectAccount() {
  const { accounts } = useWallets();

  if (accounts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No accounts connected</p>
      </div>
    );
  }

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {account.platform === "polkadot" ? account.name : "Account"}
              </span>
              <span className="text-muted-foreground">
                {shortenAddress(account.address)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 5.2 Update Page Component

**File: `app/page.tsx`**

```typescript
import { fontUnbounded } from "@/fonts";
import { cn } from "@/lib/utils";
import { Link } from "@/components/ui/link";
import { ChainInfoCards } from "@/components/info-cards/chain-info-cards";
import { AccountInfoCards } from "@/components/info-cards/account-info-cards";
import { ExtrinsicInfoCards } from "@/components/info-cards/extrinsic-info-cards";
import { WalletConnectorModal } from "@/components/wallet/wallet-connector-modal";

export default async function Home() {
  return (
    <main className="flex min-h-screen p-6 sm:p-8 pb-20 flex-col gap-[32px] row-start-2 items-center relative">
      <h1
        className={cn(
          "text-5xl lg:text-6xl font-light pt-10",
          fontUnbounded.className,
        )}
      >
        Polkadot Next.js Starter
      </h1>
      <p className="text-center text-muted-foreground text-lg">
        A starter project for your next Polkadot dApp with Kheopskit.
      </p>

      <ChainInfoCards />
      <AccountInfoCards />
      <ExtrinsicInfoCards />
      
      {/* Add wallet connector modal */}
      <WalletConnectorModal />
    </main>
  );
}
```

---

## 🧪 **Phase 6: Testing & Validation**

### 6.1 Test Wallet Connections

1. **Polkadot Wallets:**
   - Polkadot.js Extension
   - Talisman
   - SubWallet

2. **Ethereum Wallets:**
   - MetaMask
   - WalletConnect (mobile)

3. **Cross-Platform:**
   - Test both platforms simultaneously
   - Verify account switching works
   - Test message signing on both platforms

### 6.2 Test Transaction Functionality

1. **Polkadot Transactions:**
   - Transfer DOT
   - Asset transfers
   - Staking operations

2. **Ethereum Transactions:**
   - ETH transfers
   - ERC-20 token transfers
   - Contract interactions

---

## 🚀 **Phase 7: Deployment**

### 7.1 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 7.2 Build & Deploy

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

---

## ✅ **Migration Checklist**

- [ ] Install Kheopskit dependencies
- [ ] Create configuration files
- [ ] Set up providers
- [ ] Create wallet connector modal
- [ ] Update existing components
- [ ] Test wallet connections
- [ ] Test transactions
- [ ] Update documentation
- [ ] Deploy to production

---

## 🎯 **Benefits After Migration**

1. **Unified Experience:** Single wallet connector for both platforms
2. **Better UX:** Modern modal-based wallet selection
3. **Mobile Support:** WalletConnect integration
4. **Type Safety:** Full TypeScript support
5. **Reactive Updates:** Real-time state synchronization
6. **Cross-Platform:** Seamless Polkadot + Ethereum support

---

## 🔧 **Troubleshooting**

### Common Issues

1. **WalletConnect Project ID:** Ensure you have a valid WalletConnect project ID
2. **Network Configuration:** Verify all networks are properly configured
3. **Provider Order:** Ensure KheopskitProvider wraps WagmiProvider
4. **SSR Issues:** Use "use client" directive for client-side components

### Debug Mode

Enable debug mode in development:

```typescript
debug: process.env.NODE_ENV === "development"
```

This will show detailed logs in the browser console.

---

## 📞 **Support**

For issues or questions:
- Kheopskit Documentation: [GitHub Repository]
- Discord: [Kheopskit Discord]
- Issues: [GitHub Issues]

---

*This implementation plan provides a complete roadmap for migrating from Reactive-Dot to Kheopskit while maintaining all existing functionality and adding modern wallet management capabilities.*

## �� **Quick Start Commands**

```bash
# 1. Install dependencies
pnpm add @kheopskit/core @kheopskit/react wagmi viem @tanstack/react-query @reown/appkit @walletconnect/universal-provider

# 2. Create environment file
echo "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id" > .env.local

# 3. Start development
pnpm dev
```

This plan gives you everything needed to successfully integrate Kheopskit into your Next.js project! 🎉