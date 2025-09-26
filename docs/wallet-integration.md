# 🔗 Wallet Integration Documentation

## Overview

This project uses **Kheopskit** for unified wallet management across Polkadot and Ethereum platforms. The implementation provides a modern, modal-based wallet connection experience.

## Architecture

### Provider Setup
```typescript
// providers/hybrid-provider.tsx
<ThemeProvider>
  <KheopskitClientProvider>
    <KheopskitSelectedAccountProvider>
      {children}
    </KheopskitSelectedAccountProvider>
  </KheopskitClientProvider>
</ThemeProvider>
```

The `KheopskitSelectedAccountProvider` provides global account selection state that persists across components and page refreshes.

### Configuration Files
- `lib/config/kheopskit.ts` - Main Kheopskit configuration
- `lib/config/wagmi.ts` - Wagmi configuration for Ethereum chains

## Components

### 1. Wallet Connector Modal
**File:** `components/wallet/wallet-connector-modal.tsx`

**Usage:**
```tsx
import { WalletConnectorModal } from "@/components/wallet/wallet-connector-modal";

// In navigation bar or any component
<WalletConnectorModal />
```

**Features:**
- Connect/disconnect wallets
- Shows connection status
- Platform detection (Polkadot/Ethereum)

### 2. Account Selection Components
**Files:** 
- `components/account/kheopskit-account-dropdown.tsx`
- `components/account/kheopskit-account-select.tsx`

**Usage:**
```tsx
import { KheopskitAccountDropdown } from "@/components/account/kheopskit-account-dropdown";

const [selectedAccount, setSelectedAccount] = useState("");

<KheopskitAccountDropdown 
  selectedAccountId={selectedAccount}
  onAccountSelect={setSelectedAccount}
/>
```

## Wallet Data Access

### Using the useWallets Hook
```tsx
import { useWallets } from "@kheopskit/react";

function MyComponent() {
  const { wallets, accounts } = useWallets();
  
  // Filter connected wallets
  const connectedWallets = wallets.filter(w => w.isConnected);
  
  // Filter by platform
  const polkadotAccounts = accounts.filter(a => a.platform === "polkadot");
  const ethereumAccounts = accounts.filter(a => a.platform === "ethereum");
}
```

### Using Global Selected Account (Recommended)
```tsx
import { useSelectedAccount, useSelectedPolkadotAccount } from "@/providers/kheopskit-selected-account-provider";

function MyComponent() {
  // Get the currently selected account across the entire app
  const selectedAccount = useSelectedAccount();
  
  // Get selected account only if it's a Polkadot account (useful for NFT minting, etc.)
  const selectedPolkadotAccount = useSelectedPolkadotAccount();
  
  if (!selectedPolkadotAccount) {
    return <div>Please select a Polkadot account</div>;
  }
  
  // Use the selected account for transactions
  const handleMint = async () => {
    const tx = await createTransaction();
    await tx.signSubmitAndWatch(selectedPolkadotAccount.polkadotSigner);
  };
}
```

### Account Selection Status Component
```tsx
import { PolkadotAccountStatus } from "@/components/account/selected-account-status";

function NFTMintingPage() {
  return (
    <div>
      <h1>Mint NFT</h1>
      
      {/* Shows account status with helpful messages */}
      <PolkadotAccountStatus 
        onOpenWalletModal={() => setWalletModalOpen(true)}
      />
      
      {/* Your minting UI */}
    </div>
  );
}
```

### Account Object Structure
```typescript
interface Account {
  id: string;
  address: string;
  name: string; // Polkadot account name
  platform: "polkadot" | "ethereum";
  walletName: string;
  polkadotSigner?: PolkadotSigner; // For Polkadot accounts
  client?: any; // For Ethereum accounts
}
```

## Signing Implementation

### Message Signing
```typescript
// Polkadot
const messageBytes = new TextEncoder().encode(message);
const signature = await account.polkadotSigner.signBytes(messageBytes);

// Ethereum
const signature = await account.client.signMessage({
  message,
  account: account.address,
});
```

### Raw Payload Signing
```typescript
// Polkadot
const payloadBytes = new Uint8Array(Buffer.from(hexPayload.slice(2), 'hex'));
const signature = await account.polkadotSigner.signBytes(payloadBytes);

// Ethereum
const signature = await (account.client as any).request({
  method: 'personal_sign',
  params: [hexPayload, account.address],
}) as string;
```

### System Remark Transactions (Polkadot-API)
```typescript
import { createClient, Binary } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { polkadot, paseo } from "@polkadot-api/descriptors";

// Create client and typed API
const provider = getWsProvider("wss://rpc.ibp.network/paseo");
const client = createClient(provider);
const typedApi = client.getTypedApi(paseo);

// Create and submit system remark
const remarkBytes = new TextEncoder().encode("Hello Polkadot!");
const tx = typedApi.tx.System.remark({ remark: Binary.fromBytes(remarkBytes) });

// Submit with Kheopskit signer
const result = await tx.signSubmitAndWatch(account.polkadotSigner);

// Watch transaction events
result.subscribe({
  next: (event) => {
    if (event.type === "finalized") {
      console.log(`Finalized in block: ${event.block.hash}`);
    }
  }
});
```

## Supported Networks

### Polkadot Networks
- Polkadot Mainnet
- Polkadot Asset Hub
- Paseo Testnet

### Ethereum Networks
- Ethereum Mainnet
- Sepolia Testnet

## Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

Get your project ID from: https://cloud.walletconnect.com/

## Testing

### Signing Demo Page
**URL:** `/signing-demo`

**Features:**
- Account selection
- Text message signing
- Raw payload signing
- System remark transactions (polkadot-api)
- Console logging of signatures and transaction events

### Navigation
The wallet connector is available in the navigation bar with a "Signing Demo" button for testing.

## Supported Wallets

### Polkadot
- Polkadot.js Extension
- Talisman
- SubWallet

### Ethereum
- MetaMask
- WalletConnect (mobile wallets)

## Error Handling

All wallet operations include:
- Toast notifications for success/error
- Try-catch blocks for error handling
- Input validation for signing operations

## Key Files

```
lib/config/
├── kheopskit.ts          # Main configuration
└── wagmi.ts              # Ethereum configuration

providers/
├── kheopskit-provider.tsx        # Core provider
├── kheopskit-client-provider.tsx # Client wrapper
└── hybrid-provider.tsx           # Combined providers

components/wallet/
└── wallet-connector-modal.tsx    # Main wallet modal

components/account/
├── kheopskit-account-dropdown.tsx # Dropdown selector
└── kheopskit-account-select.tsx   # Card selector

app/signing-demo/
└── page.tsx                      # Testing page
```

## Quick Start

1. **Connect Wallet:** Click "Connect Wallet" in navigation
2. **Select Account:** Use dropdown or card selector
3. **Sign Data:** Use `account.polkadotSigner.signBytes()` or `account.client.signMessage()`
4. **Handle Results:** Check console for full signature outputs

## Troubleshooting

### Common Transaction Errors

**Payment Error (InvalidTxError: Payment)**
```
Transaction error: InvalidTxError: {
  "type": "Invalid",
  "value": { "type": "Payment" }
}
```

**Solution:** 
- Insufficient balance to pay transaction fees
- Get testnet tokens from [Polkadot Faucet](https://faucet.polkadot.io/) for Paseo
- Check account balance before submitting transactions

**Balance Checking:**
```typescript
const accountInfo = await typedApi.query.System.Account.getValue(address);
const freeBalance = accountInfo?.data.free || 0n;
```

**Fee Estimation:**
```typescript
const paymentInfo = await tx.getEstimatedFees(address);
console.log("Estimated fee:", paymentInfo);
```

### Getting Testnet Tokens

- **Paseo (PAS):** Free tokens from [Polkadot Faucet](https://faucet.polkadot.io/)
- **Polkadot (DOT):** Real tokens required from exchanges

---

*This implementation provides a unified wallet experience while maintaining platform-specific functionality.*
