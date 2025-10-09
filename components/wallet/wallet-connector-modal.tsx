"use client";

import { useState, useEffect, useRef } from "react";
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
import Image from "next/image";
import { Wallet, Check, ArrowLeft, User, Plug, PlugZap } from "lucide-react";
import { toast } from "sonner";
import Identicon from "@polkadot/react-identicon";
import { useSelectedAccount } from "@/hooks/use-selected-account";

// Enhanced Wallet Card Component with Connection Status
const EnhancedWalletCard = ({ 
  wallet, 
  onConnect, 
  onDisconnect,
  onViewAccounts,
  accounts 
}: { 
  wallet: any; 
  onConnect: () => void;
  onDisconnect: () => void;
  onViewAccounts?: () => void;
  accounts: any[];
}) => {
  const walletAccounts = accounts.filter(account => account.walletName === wallet.name);
  const accountCount = walletAccounts.length;

  return (
    <Card 
      className={`p-4 transition-all hover:shadow-sm ${
        wallet.isConnected 
          ? 'ring-1 ring-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10' 
          : 'hover:bg-muted/50'
      }`}
      onClick={wallet.isConnected && onViewAccounts ? onViewAccounts : undefined}
    >
      <div className="flex items-center gap-3">
        {wallet.icon && (
          <Image
            src={wallet.icon.trim()}
            alt={wallet.name}
            width={32}
            height={32}
            className="rounded"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{wallet.name}</span>
            {wallet.isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Connected</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground capitalize">
              {wallet.platform}
            </div>
            {wallet.isConnected && accountCount > 0 && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {accountCount} account{accountCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          {wallet.isConnected && onViewAccounts && (
            <div className="text-xs text-primary mt-1">
              Click to view accounts →
            </div>
          )}
        </div>
        <Button 
          size="sm" 
          variant={wallet.isConnected ? "destructive" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            wallet.isConnected ? onDisconnect() : onConnect();
          }}
        >
          {wallet.isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </Card>
  );
};

// Account Card Component
const AccountCard = ({ 
  account, 
  isSelected, 
  onSelect 
}: { 
  account: any; 
  isSelected: boolean; 
  onSelect: () => void; 
}) => (
  <Card 
    className={`p-4 cursor-pointer transition-all ${
      isSelected 
        ? 'ring-2 ring-primary bg-primary/5 shadow-sm' 
        : 'hover:bg-muted/50 hover:shadow-sm'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center gap-3">
      <div className="relative">
        <Identicon
          value={account.address}
          size={40}
          theme="polkadot"
          className="rounded-full"
        />
      </div>
      <div className="flex-1">
        <div className="font-medium">
          {account.platform === "polkadot" && 'name' in account ? account.name : "Account"}
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          {shortenAddress(account.address)}
        </div>
        <div className="text-xs text-muted-foreground">
          {account.walletName} • {account.platform}
        </div>
      </div>
      {isSelected && (
        <div className="text-primary">
          <Check className="h-5 w-5" />
        </div>
      )}
    </div>
  </Card>
);

export const WalletConnectorModal = () => {
  const { wallets, accounts } = useWallets();
  const { selectedAccount, setSelectedAccount } = useSelectedAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"wallets" | "accounts">("wallets");
  const [forceWalletView, setForceWalletView] = useState(false);
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(null);

  const connectedWallets = wallets.filter(wallet => wallet.isConnected);
  const hasConnectedWallets = connectedWallets.length > 0;

  // Use ref to prevent useEffect conflicts
  const isUserNavigating = useRef(false);

  // Filter accounts based on selected wallet (if any) with normalized comparison
  const filteredAccounts = selectedWalletName 
    ? accounts.filter(account => account.walletName?.trim() === selectedWalletName.trim())
    : accounts;

  // Auto-select account if only one is available
  useEffect(() => {
    if (filteredAccounts.length === 1 && !selectedAccount && currentView === "accounts") {
      setSelectedAccount(filteredAccounts[0]);
    }
  }, [filteredAccounts, selectedAccount, currentView, setSelectedAccount]);

  // Note: Smart cleanup is handled by the global provider

  // Smart view management - but respect user navigation
  useEffect(() => {
    if (isUserNavigating.current || forceWalletView) {
      return; // Don't auto-change view if user is navigating or forced to wallet view
    }

    if (hasConnectedWallets && accounts.length > 0) {
      setCurrentView("accounts");
    } else {
      setCurrentView("wallets");
    }
  }, [hasConnectedWallets, accounts.length, forceWalletView]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Don't reset selectedAccount - preserve across modal sessions
      setForceWalletView(false);
      setSelectedWalletName(null);
      isUserNavigating.current = false;
      // Reset view based on current connection state
      setTimeout(() => {
        setCurrentView(hasConnectedWallets && accounts.length > 0 ? "accounts" : "wallets");
      }, 100);
    }
  }, [isOpen, hasConnectedWallets, accounts.length]);

  const handleWalletConnect = async (wallet: any) => {
    try {
      await wallet.connect();
      toast.success(`${wallet.name} connected successfully!`);
      
      // Set the wallet filter to show only this wallet's accounts when transitioning to accounts view
      setSelectedWalletName(wallet.name.trim());
      
      // Allow auto-transition to accounts after successful connection
      setForceWalletView(false);
    } catch (error) {
      toast.error(`Failed to connect ${wallet.name}: ${(error as Error).message}`);
    }
  };

  const handleWalletDisconnect = (wallet: any) => {
    wallet.disconnect();
    toast.success(`${wallet.name} disconnected`);
    // Don't clear global selection - let the provider handle cleanup
  };

  const handleDisconnectAll = () => {
    connectedWallets.forEach(wallet => wallet.disconnect());
    setSelectedAccount(null); // Clear global selection
    setCurrentView("wallets");
    setForceWalletView(true);
    toast.success("All wallets disconnected");
  };

  const handleBackToWallets = () => {
    isUserNavigating.current = true;
    setCurrentView("wallets");
    setForceWalletView(true);
    // Don't reset selectedAccount - preserve user's selection
    setSelectedWalletName(null);
    setTimeout(() => {
      isUserNavigating.current = false;
    }, 500);
  };

  const handleProceedToAccounts = () => {
    if (hasConnectedWallets && accounts.length > 0) {
      isUserNavigating.current = true;
      setCurrentView("accounts");
      setForceWalletView(false);
      setSelectedWalletName(null); // Show all accounts
      // Don't reset selectedAccount - preserve user's selection
      setTimeout(() => {
        isUserNavigating.current = false;
      }, 500);
    }
  };

  const handleViewWalletAccounts = (walletName: string) => {
    isUserNavigating.current = true;
    setCurrentView("accounts");
    setForceWalletView(false);
    
    // Normalize wallet name (trim whitespace)
    const normalizedWalletName = walletName.trim();
    setSelectedWalletName(normalizedWalletName);
    
    // Always clear account selection if current selection doesn't belong to this wallet
    if (selectedAccount) {
      const currentAccountWallet = selectedAccount.walletName?.trim();
      if (currentAccountWallet !== normalizedWalletName) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WalletConnector] Clearing selection: switching from', currentAccountWallet, 'to', normalizedWalletName);
        }
        setSelectedAccount(null);
      }
    }
    
    setTimeout(() => {
      isUserNavigating.current = false;
    }, 500);
  };

  const handleSignMessage = async (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const message = "Hello from Polkadot Next.js Starter!";
    
    try {
      if (account.platform === "polkadot") {
        const messageBytes = new TextEncoder().encode(message);
        const signature = await account.polkadotSigner.signBytes(messageBytes);
        const hexSignature = Array.from(signature).map(b => (b as number).toString(16).padStart(2, '0')).join('');
        toast.success(`Signature: 0x${hexSignature.slice(0, 20)}...`);
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

  const handleComplete = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      const name = account.platform === "polkadot" && 'name' in account ? account.name : "Account";
      toast.success(`Account ${name} selected!`);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
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

        <div className="space-y-4">
          {/* Wallet Connection View */}
          {currentView === "wallets" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Available Wallets</h3>
                <div className="text-xs text-muted-foreground">
                  {wallets.length} wallets
                </div>
              </div>
              
              <div className="space-y-2">
                {wallets.map((wallet) => (
                  <EnhancedWalletCard
                    key={wallet.id}
                    wallet={wallet}
                    accounts={accounts}
                    onConnect={() => handleWalletConnect(wallet)}
                    onDisconnect={() => handleWalletDisconnect(wallet)}
                    onViewAccounts={wallet.isConnected ? () => handleViewWalletAccounts(wallet.name) : undefined}
                  />
                ))}
              </div>

              {/* Continue Button (shows when wallets are connected) */}
              {hasConnectedWallets && accounts.length > 0 && (
                <div className="border-t pt-4">
                  <Button
                    onClick={handleProceedToAccounts}
                    className="w-full"
                    size="lg"
                  >
                    Continue to Account Selection
                  </Button>
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    {accounts.length} account{accounts.length !== 1 ? 's' : ''} available
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Selection View */}
          {currentView === "accounts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToWallets}
                    className="p-1 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h3 className="text-sm font-medium">Select Account</h3>
                    {selectedWalletName && (
                      <div className="text-xs text-muted-foreground">
                        From {selectedWalletName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedWalletName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[WalletConnector] Showing all accounts from all wallets');
                        }
                        setSelectedWalletName(null);
                        // Preserve user's selection - it will remain valid if it exists in all accounts
                      }}
                      className="text-xs"
                    >
                      Show All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnectAll}
                    className="text-xs"
                  >
                    Change Wallet
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    isSelected={selectedAccount?.id === account.id}
                    onSelect={() => {
                      // Enhanced selection logic: clear old account if switching wallets
                      if (selectedAccount && selectedAccount.walletName?.trim() !== account.walletName?.trim()) {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[WalletConnector] Account selection: switching wallet from', 
                            selectedAccount.walletName, 'to', account.walletName);
                        }
                        // First clear the old selection
                        setSelectedAccount(null);
                        // Then set the new one in next tick to ensure clean state transition
                        setTimeout(() => setSelectedAccount(account), 0);
                      } else {
                        // Same wallet or no previous selection - direct update
                        setSelectedAccount(account);
                      }
                    }}
                  />
                ))}
              </div>

              {/* Quick Actions */}
   {/* @ */}

              {/* Connected Wallets Summary */}
              <div className="border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  {selectedWalletName ? (
                    <>
                      Showing accounts from {selectedWalletName} • {" "}
                      <button 
                        onClick={() => {
                          if (process.env.NODE_ENV === 'development') {
                            console.log('[WalletConnector] View all accounts clicked');
                          }
                          setSelectedWalletName(null);
                          // Preserve user's selection - it will remain valid if it exists in all accounts
                        }}
                        className="text-primary hover:underline"
                      >
                        View all {accounts.length} accounts
                      </button>
                    </>
                  ) : (
                    <>
                      All connected wallets: {connectedWallets.map(w => w.name).join(", ")}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
