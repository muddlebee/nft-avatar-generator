"use client";

import { Download, Sparkles, Eye, Wand2, Coins, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PreviewPaneProps } from "./types";

export function PreviewPane({ 
  baseImage, 
  variants, 
  lockedVariant, 
  onVariantSelect, 
  isGenerating,
  canGenerate,
  hasVariants,
  onGenerate,
  onLock,
  onMint,
  referralCodeValidated,
  referralCodeTier,
  attemptsUsed,
  maxAttempts
}: PreviewPaneProps) {
  const selectedVariant = lockedVariant || variants[0];

  const getGenerateButtonText = () => {
    if (isGenerating) return "Generating...";
    if (hasVariants) return "Regenerate";
    return "Generate Avatar";
  };

  const getGenerateButtonIcon = () => {
    if (isGenerating) return <Loader2 className="w-4 h-4 animate-spin" />;
    return <Wand2 className="w-4 h-4" />;
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5" />
          Preview & Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Area */}
        <div>
          {isGenerating ? (
            <div className="aspect-square max-w-md mx-auto bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Generating avatar...</p>
              </div>
            </div>
          ) : !baseImage ? (
            <div className="aspect-square max-w-md mx-auto bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-3">
                <Sparkles className="w-10 h-10 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium">Upload an image to start</p>
                  <p className="text-sm text-muted-foreground">Your generated avatar will appear here</p>
                </div>
              </div>
            </div>
          ) : variants.length === 0 ? (
            <div className="aspect-square max-w-md mx-auto bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <img
                src={baseImage}
                alt="Base avatar"
                className="w-full h-full object-contain bg-muted/20"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto" />
                  <p className="font-medium">Ready to generate!</p>
                  <p className="text-sm opacity-90">Click Generate Avatar below</p>
                </div>
              </div>
            </div>
          ) : selectedVariant ? (
            <div className="aspect-square max-w-md mx-auto relative group rounded-lg overflow-hidden">
              <img
                src={selectedVariant.url}
                alt="Generated avatar"
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium">
                  Seed: {selectedVariant.seed}
                </p>
              </div>
            </div>
          ) : null}
        </div>



        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            size="lg"
            className={cn(
              "w-full flex items-center gap-2",
              hasVariants && !isGenerating && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {getGenerateButtonIcon()}
            {getGenerateButtonText()}
          </Button>

          {/* Download & Mint Buttons */}
          {hasVariants && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  if (selectedVariant?.url) {
                    const link = document.createElement('a');
                    link.href = selectedVariant.url;
                    link.download = `avatar-${selectedVariant.seed}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                disabled={!hasVariants || isGenerating}
                variant="outline"
                size="lg"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>

              <Button
                onClick={onMint}
                disabled={true}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Coins className="w-4 h-4" />
                Mint NFT
              </Button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        <div className="text-center">
          {!canGenerate && (
            <p className="text-xs text-muted-foreground">
              {!referralCodeValidated 
                ? "Enter a valid referral code to start generating"
                : attemptsUsed >= maxAttempts
                ? "No attempts remaining with this code"
                : "Upload an image and select traits to generate"
              }
            </p>
          )}
          
          {referralCodeValidated && attemptsUsed < maxAttempts && (
            <p className="text-xs text-green-600 dark:text-green-400 mb-2">
              ✓ {referralCodeTier} Code Active • {maxAttempts - attemptsUsed} attempts remaining
            </p>
          )}
          
          {referralCodeValidated && attemptsUsed >= maxAttempts && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-2">
              ⚠️ {referralCodeTier} Code Exhausted • 0 attempts remaining
            </p>
          )}
          
          {hasVariants && (
            <p className="text-xs text-muted-foreground">
              Download your avatar or mint it as an NFT
            </p>
          )}
          
          {isGenerating && (
            <p className="text-xs text-primary">
              🎨 Creating your unique avatar...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}