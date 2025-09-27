import { NavControls } from "./nav-controls";
import { fontUnbounded } from "@/fonts";
import { cn } from "@/lib/utils";

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
          <NavControls /> 
        </div>
      </div>
    </header>
  );
}
