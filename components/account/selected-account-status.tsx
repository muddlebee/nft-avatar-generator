"use client";

import { useKheopskitSelectedAccount } from "@/providers/kheopskit-selected-account-provider";
import { useWallets } from "@kheopskit/react";
import { shortenAddress } from "@/lib/utils";
import { Check, User, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Identicon from "@polkadot/react-identicon";

interface SelectedAccountStatusProps {
  requiredPlatform?: "polkadot" | "ethereum";
  showFullAddress?: boolean;
  compact?: boolean;
  onOpenWalletModal?: () => void;
}

export function SelectedAccountStatus({
  requiredPlatform,
  showFullAddress = false,
  compact = false,
  onOpenWalletModal
}: SelectedAccountStatusProps) {
  const { selectedAccount } = useKheopskitSelectedAccount();
  const { accounts } = useWallets();

  const hasAccounts = accounts.length > 0;
  const hasRequiredPlatformAccounts = requiredPlatform 
    ? accounts.some(acc => acc.platform === requiredPlatform)
    : true;

  // No accounts connected at all
  if (!hasAccounts) {
    return (
      <Card className="p-4 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <div className="font-medium text-amber-800">No Wallets Connected</div>
            <div className="text-sm text-amber-700">
              Connect a wallet to get started
            </div>
          </div>
          {onOpenWalletModal && (
            <Button size="sm" onClick={onOpenWalletModal}>
              Connect Wallet
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // No accounts for required platform
  if (!hasRequiredPlatformAccounts) {
    return (
      <Card className="p-4 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <div className="font-medium text-amber-800">
              No {requiredPlatform} Account Connected
            </div>
            <div className="text-sm text-amber-700">
              Connect a {requiredPlatform} wallet to continue
            </div>
          </div>
          {onOpenWalletModal && (
            <Button size="sm" onClick={onOpenWalletModal}>
              Connect {requiredPlatform} Wallet
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // No account selected
  if (!selectedAccount) {
    return (
      <Card className="p-4 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium text-blue-800">No Account Selected</div>
            <div className="text-sm text-blue-700">
              {requiredPlatform 
                ? `Select a ${requiredPlatform} account to continue`
                : "Select an account to continue"
              }
            </div>
          </div>
          {onOpenWalletModal && (
            <Button size="sm" onClick={onOpenWalletModal}>
              Select Account
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Wrong platform selected
  if (requiredPlatform && selectedAccount.platform !== requiredPlatform) {
    return (
      <Card className="p-4 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <div className="font-medium text-amber-800">Wrong Account Type</div>
            <div className="text-sm text-amber-700">
              A {requiredPlatform} account is required, but you have selected a {selectedAccount.platform} account
            </div>
          </div>
          {onOpenWalletModal && (
            <Button size="sm" onClick={onOpenWalletModal}>
              Select {requiredPlatform} Account
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Account selected and valid
  const accountName = selectedAccount.platform === "polkadot" && 'name' in selectedAccount 
    ? selectedAccount.name 
    : "Account";

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600" />
        <span>
          {accountName} • {showFullAddress ? selectedAccount.address : shortenAddress(selectedAccount.address)}
        </span>
      </div>
    );
  }

  return (
    <Card className="p-4 border-green-200 bg-green-50">
      <div className="flex items-center gap-3">
        <Identicon
          value={selectedAccount.address}
          size={32}
          theme="polkadot"
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="font-medium text-green-800 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {accountName}
          </div>
          <div className="text-sm text-green-700 font-mono">
            {showFullAddress ? selectedAccount.address : shortenAddress(selectedAccount.address)}
          </div>
          <div className="text-xs text-green-600">
            {selectedAccount.walletName} • {selectedAccount.platform}
          </div>
        </div>
        {onOpenWalletModal && (
          <Button variant="outline" size="sm" onClick={onOpenWalletModal}>
            Change
          </Button>
        )}
      </div>
    </Card>
  );
}

// Convenience component for Polkadot-specific operations
export function PolkadotAccountStatus(props: Omit<SelectedAccountStatusProps, 'requiredPlatform'>) {
  return <SelectedAccountStatus {...props} requiredPlatform="polkadot" />;
}

// Convenience component for Ethereum-specific operations  
export function EthereumAccountStatus(props: Omit<SelectedAccountStatusProps, 'requiredPlatform'>) {
  return <SelectedAccountStatus {...props} requiredPlatform="ethereum" />;
}
