"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AccountDropdown } from "@/components/account/account-dropdown";
import { useSelectedAccount, useSelectedPolkadotAccount } from "@/hooks/use-selected-account";
import { toast } from "sonner";
import { ArrowLeft, FileSignature, Hash, Send } from "lucide-react";
import Link from "next/link";
import { paseoAssetHub } from "@/lib/config/kheopskit";
import { paseo, polkadot } from "@polkadot-api/descriptors";
import { createClient, Binary } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

export default function SigningDemo() {
  const { selectedAccount, setSelectedAccount } = useSelectedAccount();
  const selectedPolkadotAccount = useSelectedPolkadotAccount();
  const [customMessage, setCustomMessage] = useState("Hello from Kheopskit!");
  const [customPayload, setCustomPayload] = useState("0x48656c6c6f20576f726c64"); // "Hello World" in hex
  const [remarkMessage, setRemarkMessage] = useState("Hello from Polkadot-API!");
  const [selectedNetwork, setSelectedNetwork] = useState<"polkadot" | "paseo">("paseo");
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [isSigningPayload, setIsSigningPayload] = useState(false);
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  const handleSignMessage = async () => {
    if (!selectedAccount) {
      toast.error("Please select an account first");
      return;
    }

    if (!customMessage.trim()) {
      toast.error("Please enter a message to sign");
      return;
    }

    setIsSigningMessage(true);
    
    try {
      if (selectedAccount.platform === "polkadot") {
        const messageBytes = new TextEncoder().encode(customMessage);
        const signature = await selectedAccount.polkadotSigner.signBytes(messageBytes);
        
        const hexSignature = Array.from(signature).map((b: unknown) => (b as number).toString(16).padStart(2, '0')).join('');
        toast.success("Message signed successfully!");
        console.log("Polkadot Message Signature:", `0x${hexSignature}`);
        
      } else if (selectedAccount.platform === "ethereum") {
        const signature = await selectedAccount.client.signMessage({
          message: customMessage,
          account: selectedAccount.address,
        });
        
        toast.success("Message signed successfully!");
        console.log("Ethereum Message Signature:", signature);
      }
    } catch (error) {
      toast.error(`Signing failed: ${(error as Error).message}`);
      console.error("Signing error:", error);
    } finally {
      setIsSigningMessage(false);
    }
  };

  const handleSignRawPayload = async () => {
    if (!selectedAccount) {
      toast.error("Please select an account first");
      return;
    }

    if (!customPayload.trim()) {
      toast.error("Please enter a payload to sign");
      return;
    }

    // Validate hex format
    if (!customPayload.startsWith("0x") || !/^0x[0-9a-fA-F]*$/.test(customPayload)) {
      toast.error("Payload must be a valid hex string starting with 0x");
      return;
    }

    setIsSigningPayload(true);
    
    try {
      if (selectedAccount.platform === "polkadot") {
        const payloadBytes = new Uint8Array(Buffer.from(customPayload.slice(2), 'hex'));
        const signature = await selectedAccount.polkadotSigner.signBytes(payloadBytes);
        
        const hexSignature = Array.from(signature).map((b: unknown) => (b as number).toString(16).padStart(2, '0')).join('');
        toast.success("Raw payload signed successfully!");
        console.log("Polkadot Raw Payload Signature:", `0x${hexSignature}`);
        
      } else if (selectedAccount.platform === "ethereum") {
        // For Ethereum, we can sign raw data using personal_sign
        const signature = await (selectedAccount.client as any).request({
          method: 'personal_sign',
          params: [customPayload, selectedAccount.address],
        }) as string;
        
        toast.success("Raw payload signed successfully!");
        console.log("Ethereum Raw Payload Signature:", signature);
      }
    } catch (error) {
      toast.error(`Signing failed: ${(error as Error).message}`);
      console.error("Signing error:", error);
    } finally {
      setIsSigningPayload(false);
    }
  };

  const handleSubmitSystemRemark = async () => {
    if (!selectedPolkadotAccount) {
      toast.error("Please select a Polkadot account first");
      return;
    }

    if (!remarkMessage.trim()) {
      toast.error("Please enter a remark message");
      return;
    }

    setIsSubmittingRemark(true);

    try {
      // Create client for the selected network
      const provider = getWsProvider(
        selectedNetwork === "polkadot" 
          ? "wss://rpc.ibp.network/polkadot"
          : "wss://rpc.ibp.network/paseo"
      );
      
      const client = createClient(provider);
      const descriptor = selectedNetwork === "polkadot" ? polkadot : paseo;
      const typedApi = client.getTypedApi(descriptor);

      // Check account balance first
      try {
        const accountInfo = await typedApi.query.System.Account.getValue(selectedPolkadotAccount.address);
        const freeBalance = accountInfo?.data.free || 0n;
        
        if (freeBalance === 0n) {
          toast.error(`No balance found. Please add some ${selectedNetwork === "polkadot" ? "DOT" : "PAS"} tokens to your account.`);
          return;
        }
        
        console.log(`Account balance: ${freeBalance.toString()} (${selectedNetwork === "polkadot" ? "DOT" : "PAS"})`);
      } catch (balanceError) {
        console.warn("Could not check balance:", balanceError);
      }

      // Create the remark transaction
      const remarkBytes = new TextEncoder().encode(remarkMessage);
      const tx = typedApi.tx.System.remark({ remark: Binary.fromBytes(remarkBytes) });

      // Get transaction fee estimate
      try {
        const paymentInfo = await tx.getEstimatedFees(selectedPolkadotAccount.address);
        console.log("Estimated transaction fee:", paymentInfo);
      } catch (feeError) {
        console.warn("Could not estimate fees:", feeError);
      }

      toast.info("Submitting transaction...");

      // Submit and watch the transaction
      const result = await tx.signSubmitAndWatch(selectedPolkadotAccount.polkadotSigner);

      console.log("Transaction submitted, watching for events...");

      // Wait for finalization
      result.subscribe({
        next: (event) => {
          console.log("Transaction Event:", event);
          if (event.type === "finalized") {
            if (event.ok) {
              toast.success(`Transaction finalized in block: ${event.block.hash}`);
            } else {
              toast.error(`Transaction failed: ${event.dispatchError?.type || "Unknown error"}`);
              console.error("Dispatch Error:", event.dispatchError);
            }
          } else {
            // Log other transaction events
            console.log(`Transaction event: ${event.type}`);
          }
        },
        error: (error) => {
          console.error("Transaction error:", error);
          if (error.type === "Invalid" && error.value?.type === "Payment") {
            toast.error(`Insufficient balance to pay transaction fees. Please add more ${selectedNetwork === "polkadot" ? "DOT" : "PAS"} tokens.`);
          } else {
            toast.error(`Transaction failed: ${error.message || "Unknown error"}`);
          }
        }
      });

    } catch (error: any) {
      console.error("System remark error:", error);
      
      if (error.type === "Invalid" && error.value?.type === "Payment") {
        toast.error(`Insufficient balance to pay transaction fees. Please add more ${selectedNetwork === "polkadot" ? "DOT" : "PAS"} tokens to your account.`);
      } else {
        toast.error(`Failed to submit remark: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">Signing Demo</h1>
          <p className="text-muted-foreground">
            Test wallet signing functionality for both Polkadot and Ethereum accounts.
          </p>
        </div>

        {/* Account Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Select Account</h2>
          <div className="space-y-4">
            <AccountDropdown placeholder="Select an account..." />
            
            {selectedAccount && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Selected Account:</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {selectedAccount.platform === "polkadot" ? selectedAccount.name : "Account"}</div>
                  <div><strong>Platform:</strong> {selectedAccount.platform}</div>
                  <div><strong>Wallet:</strong> {selectedAccount.walletName}</div>
                  <div><strong>Address:</strong> <code className="bg-background px-1 rounded text-xs">{selectedAccount.address}</code></div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Message Signing */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            2. Sign Text Message
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Message to Sign:</label>
              <textarea
                className="w-full p-3 border rounded-md bg-background"
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message here..."
              />
            </div>
            <Button 
              onClick={handleSignMessage}
              disabled={!selectedAccount || !customMessage.trim() || isSigningMessage}
              className="w-full"
            >
              {isSigningMessage ? "Signing..." : "Sign Message"}
            </Button>
          </div>
        </Card>

        {/* Raw Payload Signing */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5" />
            3. Sign Raw Payload
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Raw Payload (Hex):</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md bg-background font-mono text-sm"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                placeholder="0x48656c6c6f20576f726c64"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be a valid hex string starting with 0x
              </p>
            </div>
            <Button 
              onClick={handleSignRawPayload}
              disabled={!selectedAccount || !customPayload.trim() || isSigningPayload}
              className="w-full"
            >
              {isSigningPayload ? "Signing..." : "Sign Raw Payload"}
            </Button>
          </div>
        </Card>

        {/* System Remark Transaction */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Send className="h-5 w-5" />
            4. Submit System Remark (Polkadot-API)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Network:</label>
              <select
                className="w-full p-3 border rounded-md bg-background"
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value as "polkadot" | "paseo")}
              >
                <option value="paseo">Paseo Testnet</option>
                <option value="polkadot">Polkadot Mainnet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Remark Message:</label>
              <textarea
                className="w-full p-3 border rounded-md bg-background"
                rows={3}
                value={remarkMessage}
                onChange={(e) => setRemarkMessage(e.target.value)}
                placeholder="Enter your remark message..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be stored on-chain as a system remark
              </p>
            </div>
            <Button 
              onClick={handleSubmitSystemRemark}
              disabled={!selectedPolkadotAccount || !remarkMessage.trim() || isSubmittingRemark}
              className="w-full"
            >
              {isSubmittingRemark ? "Submitting..." : "Submit System Remark"}
            </Button>
            {selectedAccount && !selectedPolkadotAccount && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                System remarks require a Polkadot account. Please connect a Polkadot wallet.
              </p>
            )}
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mt-4">
              <h4 className="font-medium text-sm mb-2">Need Testnet Tokens?</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Paseo (PAS):</strong> Get free tokens from <a href="https://faucet.polkadot.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Polkadot Faucet</a></div>
                <div><strong>Polkadot (DOT):</strong> Real tokens required - use exchanges or other sources</div>
                <div className="mt-2 text-amber-600 dark:text-amber-400">
                  ⚠️ Ensure your account has sufficient balance to pay transaction fees
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Connect Wallet:</strong> Use the &quot;Connect Wallet&quot; button in the navigation bar to connect your Polkadot or Ethereum wallet.
            </div>
            <div>
              <strong>2. Select Account:</strong> Choose an account from the dropdown above.
            </div>
            <div>
              <strong>3. Test Signing:</strong> Try signing both text messages and raw hex payloads.
            </div>
            <div>
              <strong>4. Submit System Remark:</strong> Test on-chain transactions using polkadot-api (Polkadot accounts only).
            </div>
            <div>
              <strong>5. Check Console:</strong> Open browser DevTools console to see the full signature outputs and transaction events.
            </div>
            <div className="p-3 bg-muted/50 rounded-lg mt-4">
              <strong>Note:</strong> Signatures will appear in the browser console. System remarks will be submitted to the actual blockchain network. Transaction events and results are logged to the console.
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
