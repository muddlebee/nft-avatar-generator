import { ThemeToggle } from "./theme-toggle";
import { ChainSelect } from "../chain/chain-select";
import { WalletSelect } from "../account/wallet-select";
import { WalletConnectorModal } from "../wallet/wallet-connector-modal";
import { fontUnbounded } from "@/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
}

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Title and Description */}
          <div className="flex-1">
            <h1
              className={cn(
                "text-3xl lg:text-4xl font-light",
                fontUnbounded.className,
              )}
            >
              NFT Avatar Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Upload, customize traits, and generate unique avatars on Polkadot
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex gap-2 items-center ml-6">
            <Link href="/signing-demo">
              <Button variant="outline" size="sm">
                Signing Demo
              </Button>
            </Link>
            <WalletConnectorModal />
            <ThemeToggle />
{/*             <ChainSelect />
            <WalletSelect /> */}
          </div> 
        </div>
      </div>
    </header>
  );
}
