"use client";

import { Lock, Sparkles, Eye, Wand2, Coins, Loader2 } from "lucide-react";
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
  onMint
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
                className="w-full h-full object-cover"
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
              {lockedVariant && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground p-2 rounded-full">
                  <Lock className="w-4 h-4" />
                </div>
              )}
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

          {/* Lock & Mint Buttons */}
          {hasVariants && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={onLock}
                disabled={!hasVariants || isGenerating || !!lockedVariant}
                variant={lockedVariant ? "default" : "outline"}
                size="lg"
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {lockedVariant ? "Locked" : "Lock"}
              </Button>

              <Button
                onClick={onMint}
                disabled={!lockedVariant || isGenerating}
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
              Upload an image and select traits to generate
            </p>
          )}
          
          {hasVariants && !lockedVariant && (
            <p className="text-xs text-muted-foreground">
              Lock a variant before minting your NFT
            </p>
          )}
          
          {lockedVariant && (
            <p className="text-xs text-green-600 dark:text-green-400">
              ✓ Variant locked! Ready to mint as NFT
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