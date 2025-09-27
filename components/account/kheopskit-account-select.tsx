"use client";

import { useWallets } from "@kheopskit/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { shortenAddress } from "@/lib/utils";
import { Check, Wallet } from "lucide-react";
import Identicon from "@polkadot/react-identicon";
import { useSelectedAccount } from "@/hooks/use-selected-account";

export function KheopskitAccountSelect() {
  const { accounts } = useWallets();
  const { selectedAccount, setSelectedAccount } = useSelectedAccount();

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No accounts connected</p>
        <p className="text-muted-foreground text-sm">Connect a wallet to get started</p>
      </div>
    );
  }

  const selectedAccount = selectedAccountId 
    ? accounts.find(account => account.id === selectedAccountId)
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Connected Accounts</h3>
        <div className="grid gap-3">
          {accounts.map((account) => (
            <Card 
              key={account.id} 
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedAccount?.id === account.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedAccount(account)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Identicon
                      value={account.address}
                      size={40}
                      theme="polkadot"
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {account.platform === "polkadot" ? account.name : "Account"}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {shortenAddress(account.address)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {account.walletName} • {account.platform}
                    </span>
                  </div>
                </div>
                {selectedAccount?.id === account.id && (
                  <div className="text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedAccount && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-2">Selected Account</h4>
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-3">
              <Identicon
                value={selectedAccount.address}
                size={32}
                theme="polkadot"
                className="rounded-full"
              />
              <div>
                <div className="font-medium">
                  {selectedAccount.platform === "polkadot" ? selectedAccount.name : "Account"}
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {selectedAccount.address}
                </div>
                <div className="text-xs text-muted-foreground">
                  Platform: {selectedAccount.platform}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

