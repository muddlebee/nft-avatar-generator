"use client";

import { useWallets } from "@kheopskit/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shortenAddress } from "@/lib/utils";
import Identicon from "@polkadot/react-identicon";

interface KheopskitAccountDropdownProps {
  onAccountSelect?: (accountId: string) => void;
  selectedAccountId?: string;
}

export function KheopskitAccountDropdown({ 
  onAccountSelect, 
  selectedAccountId 
}: KheopskitAccountDropdownProps) {
  const { accounts } = useWallets();

  if (accounts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No accounts connected</p>
      </div>
    );
  }

  const selectedAccount = selectedAccountId 
    ? accounts.find(account => account.id === selectedAccountId)
    : null;

  return (
    <Select value={selectedAccountId || ""} onValueChange={onAccountSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select account">
          {selectedAccount && (
            <div className="flex items-center gap-2">
              <Identicon
                value={selectedAccount.address}
                size={20}
                theme="polkadot"
                className="rounded-full"
              />
              <span className="font-medium">
                {selectedAccount.platform === "polkadot" ? selectedAccount.name : "Account"}
              </span>
              <span className="text-muted-foreground text-sm">
                {shortenAddress(selectedAccount.address)}
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-2 w-full">
              <Identicon
                value={account.address}
                size={20}
                theme="polkadot"
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {account.platform === "polkadot" ? account.name : "Account"}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{shortenAddress(account.address)}</span>
                  <span>•</span>
                  <span>{account.platform}</span>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

