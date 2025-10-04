'use client';

import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { Button } from "../ui/button";
import dynamic from "next/dynamic";

// Dynamically import wallet wrapper to avoid SSR issues
const WalletNavWrapper = dynamic(
  () => import("./wallet-nav-wrapper").then(mod => ({ default: mod.WalletNavWrapper })),
  { 
    ssr: false,
    loading: () => (
      <Button disabled>
        Connect Wallet
      </Button>
    )
  }
);

export function NavControls() {
  return (
    <div className="flex gap-2 items-center ml-6">
      {/* <Link href="/signing-demo">
        <Button variant="outline" size="sm">
          Signing Demo
        </Button>
      </Link> */}
      <WalletNavWrapper />
      <ThemeToggle />
    </div>
  );
}
