"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KheopskitAccountDropdown } from "@/components/account/kheopskit-account-dropdown";
import { useWallets } from "@kheopskit/react";
import { toast } from "sonner";
import { ArrowLeft, FileSignature, Hash } from "lucide-react";
import Link from "next/link";

export default function SigningDemo() {
  const { accounts } = useWallets();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("Hello from Kheopskit!");
  const [customPayload, setCustomPayload] = useState("0x48656c6c6f20576f726c64"); // "Hello World" in hex
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [isSigningPayload, setIsSigningPayload] = useState(false);

  const selectedAccount = selectedAccountId 
    ? accounts.find(account => account.id === selectedAccountId)
    : null;

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
        
        const hexSignature = Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
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
        
        const hexSignature = Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
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
            <KheopskitAccountDropdown 
              selectedAccountId={selectedAccountId}
              onAccountSelect={setSelectedAccountId}
            />
            
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

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Connect Wallet:</strong> Use the "Connect Wallet" button in the navigation bar to connect your Polkadot or Ethereum wallet.
            </div>
            <div>
              <strong>2. Select Account:</strong> Choose an account from the dropdown above.
            </div>
            <div>
              <strong>3. Test Signing:</strong> Try signing both text messages and raw hex payloads.
            </div>
            <div>
              <strong>4. Check Console:</strong> Open browser DevTools console to see the full signature outputs.
            </div>
            <div className="p-3 bg-muted/50 rounded-lg mt-4">
              <strong>Note:</strong> Signatures will appear in the browser console. For production use, you would handle these signatures according to your application's needs.
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
