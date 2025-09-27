import { ChainInfo } from "@/components/chain/chain-info";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";
import { Toaster } from "@/components/ui/sonner";
import { fontMono, fontSans } from "@/fonts";
import { Analytics } from "@vercel/analytics/react";
import { Loader } from "lucide-react";
import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/providers/wallet-provider";

export const metadata: Metadata = {
  title: "NFT Avatar Generator - Polkadot",
  description: "Create unique NFT avatars with customizable traits on the Polkadot network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-[family-name:var(--font-sans)] antialiased`}
      >
        {/* Server components */}
        <NavBar />
        <main className="min-h-screen">
          {/* Client boundary only where wallet functionality is needed */}
          <WalletProvider>
            {children}
          </WalletProvider>
        </main>
        {/* <Footer /> 
        <ChainInfo />
        */}
        <Toaster position="bottom-center" icons={{ loading: <Loader /> }} />
        <Analytics />
      </body>
    </html>
  );
}
