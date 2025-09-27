"use client";

import { useWallets } from "@kheopskit/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shortenAddress } from "@/lib/utils";
import Identicon from "@polkadot/react-identicon";
import { useSelectedAccount } from "@/hooks/use-selected-account";

interface AccountDropdownProps {
  placeholder?: string;
  className?: string;
}

export function AccountDropdown({ 
  placeholder = "Select account...",
  className = ""
}: AccountDropdownProps) {
  const { accounts } = useWallets();
  const { selectedAccount, setSelectedAccount } = useSelectedAccount();

  if (accounts.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="No accounts connected" />
        </SelectTrigger>
      </Select>
    );
  }

  const handleAccountSelect = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
    }
  };

  return (
    <Select
      value={selectedAccount?.id || ""}
      onValueChange={handleAccountSelect}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem 
            key={account.id} 
            value={account.id}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-3 w-full">
              <Identicon
                value={account.address}
                size={24}
                theme="polkadot"
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {('name' in account ? account.name : undefined) || `${account.platform} Account`}
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {shortenAddress(account.address)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {account.walletName} • {account.platform}
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// For backward compatibility
export { AccountDropdown as KheopskitAccountDropdown };
