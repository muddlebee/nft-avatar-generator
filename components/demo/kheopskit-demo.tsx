"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KheopskitAccountSelect } from "@/components/account/kheopskit-account-select";
import { KheopskitAccountDropdown } from "@/components/account/kheopskit-account-dropdown";
import { useWallets } from "@kheopskit/react";
import { toast } from "sonner";

export function KheopskitDemo() {
  const { wallets, accounts } = useWallets();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const connectedWallets = wallets.filter(wallet => wallet.isConnected);
  const selectedAccount = selectedAccountId 
    ? accounts.find(account => account.id === selectedAccountId)
    : null;

  const handleSignMessage = async () => {
    if (!selectedAccount) {
      toast.error("Please select an account first");
      return;
    }

    const message = "Hello from Kheopskit Demo!";
    
    try {
      if (selectedAccount.platform === "polkadot") {
        const messageBytes = new TextEncoder().encode(message);
        const signature = await selectedAccount.polkadotSigner.signBytes(messageBytes);
        const hexSignature = Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
        toast.success(`Message signed successfully! Signature: 0x${hexSignature.slice(0, 20)}...`);
      } else if (selectedAccount.platform === "ethereum") {
        const signature = await selectedAccount.client.signMessage({
          message,
          account: selectedAccount.address,
        });
        toast.success(`Message signed successfully! Signature: ${signature.slice(0, 20)}...`);
      }
    } catch (error) {
      toast.error(`Signing failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Kheopskit Integration Demo</h2>
        <p className="text-muted-foreground mb-6">
          This demo showcases the new Kheopskit wallet integration with support for both Polkadot and Ethereum wallets.
        </p>
      </div>

      {/* Connection Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{wallets.length}</div>
            <div className="text-sm text-muted-foreground">Available Wallets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{connectedWallets.length}</div>
            <div className="text-sm text-muted-foreground">Connected Wallets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{accounts.length}</div>
            <div className="text-sm text-muted-foreground">Available Accounts</div>
          </div>
        </div>
      </Card>

      {/* Account Dropdown Demo */}
      {accounts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Selection (Dropdown)</h3>
          <div className="space-y-4">
            <KheopskitAccountDropdown 
              selectedAccountId={selectedAccountId}
              onAccountSelect={setSelectedAccountId}
            />
            {selectedAccount && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Selected Account Details:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {selectedAccount.platform === "polkadot" ? selectedAccount.name : "Account"}</div>
                  <div><strong>Address:</strong> <code className="bg-background px-1 rounded">{selectedAccount.address}</code></div>
                  <div><strong>Platform:</strong> {selectedAccount.platform}</div>
                  <div><strong>Wallet:</strong> {selectedAccount.walletName}</div>
                </div>
                <Button 
                  onClick={handleSignMessage}
                  className="mt-4"
                  size="sm"
                >
                  Sign Test Message
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Account List Demo */}
      {accounts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account List (Cards)</h3>
          <KheopskitAccountSelect />
        </Card>
      )}

      {/* Wallet Features */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Supported Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Polkadot Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Connect to Polkadot.js Extension</li>
              <li>• Connect to Talisman</li>
              <li>• Connect to SubWallet</li>
              <li>• Sign raw messages</li>
              <li>• Multiple network support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Ethereum Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Connect to MetaMask</li>
              <li>• WalletConnect support</li>
              <li>• Sign messages</li>
              <li>• Multiple chain support</li>
              <li>• EIP-1193 compatibility</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

