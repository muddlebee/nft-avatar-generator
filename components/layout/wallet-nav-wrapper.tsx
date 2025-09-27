'use client';

import { WalletProvider } from "@/providers/wallet-provider";
import { WalletConnectorModal } from "../wallet/wallet-connector-modal";

export function WalletNavWrapper() {
  return (
    <WalletProvider>
      <WalletConnectorModal />
    </WalletProvider>
  );
}
