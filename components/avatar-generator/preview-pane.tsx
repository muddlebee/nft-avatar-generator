"use client";

import { Download, Sparkles, Eye, Wand2, Coins, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWallets } from "@kheopskit/react";
import { useNFTMinting } from "@/hooks/use-nft-minting";
import { MintingProgress } from "./minting-progress";
import type { PreviewPaneProps, MintingProgress as MintingProgressType } from "./types";

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
  const { accounts } = useWallets();
  const { mintNFT, isConfigured, configStatus } = useNFTMinting();
  
  const [showMintingProgress, setShowMintingProgress] = useState(false);
  const [mintingProgress, setMintingProgress] = useState<MintingProgressType>({
    step: 'idle',
    message: '',
    progress: 0
  });

  const selectedVariant = lockedVariant || variants[0];
  const polkadotAccount = accounts.find(acc => acc.platform === 'polkadot');
  
  // TEMPORARY: Allow minting with just base image for testing
  const hasTestableImage = baseImage || selectedVariant;
  const canMint = hasTestableImage && polkadotAccount && isConfigured;

  const getGenerateButtonText = () => {
    if (isGenerating) return "Generating...";
    if (hasVariants) return "Regenerate";
    return "Generate Avatar";
  };

  const getGenerateButtonIcon = () => {
    if (isGenerating) return <Loader2 className="w-4 h-4 animate-spin" />;
    return <Wand2 className="w-4 h-4" />;
  };

  const handleMintNFT = async () => {
    if (!canMint) return;

    // TEMPORARY: Use base image or variant for testing
    const imageToMint = lockedVariant?.url || selectedVariant?.url || baseImage;
    const traitsToUse = lockedVariant?.traits || selectedVariant?.traits || {
      headgear: 'None',
      accessory: 'None', 
      clothing: 'Default',
      background: 'Plain',
      expression: 'Neutral',
      hair: 'Default',
      skin: 'Default',
      special: null,
      weapon: null
    };
    const seedToUse = lockedVariant?.seed || selectedVariant?.seed || Math.floor(Math.random() * 10000);

    if (!imageToMint) {
      console.error('No image available for minting');
      return;
    }

    setShowMintingProgress(true);
    setMintingProgress({
      step: 'uploading-image',
      message: 'Starting NFT minting process...',
      progress: 5
    });

    try {
      const result = await mintNFT(
        imageToMint,
        traitsToUse,
        seedToUse,
        setMintingProgress
      );
      
      console.log('NFT minted successfully:', result);
    } catch (error) {
      console.error('NFT minting failed:', error);
      // Error handling is done in the mintNFT function
    }
  };

  const handleCloseProgress = () => {
    setShowMintingProgress(false);
    setMintingProgress({
      step: 'idle',
      message: '',
      progress: 0
    });
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
            <div className="space-y-3">
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

                {/* Lock Variant Button */}
                <Button
                  onClick={() => selectedVariant && onVariantSelect(selectedVariant)}
                  disabled={!selectedVariant || !!lockedVariant || isGenerating}
                  variant="secondary"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {lockedVariant ? 'Locked' : 'Lock'}
                </Button>
              </div>
            </div>
          )}

          {/* TEMPORARY: Test Mint NFT Button - Show for any uploaded image */}
          {hasTestableImage && (
            <div className="space-y-2">
              {/* Testing Mode Banner */}
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 text-center font-medium">
                  🧪 Testing Mode: Mint NFT with uploaded image
                </p>
              </div>
              
              <Button
                onClick={handleMintNFT}
                disabled={!canMint || mintingProgress.step !== 'idle'}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                <Coins className="w-4 h-4 mr-2" />
                {mintingProgress.step !== 'idle' ? 'Minting...' : 'Test Mint NFT on Paseo'}
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
          
          {/* TEMPORARY: Testing mode messages */}
          {hasTestableImage && !polkadotAccount && (
            <p className="text-xs text-amber-600">
              Connect a Polkadot wallet to test NFT minting
            </p>
          )}
          
          {hasTestableImage && polkadotAccount && !isConfigured && (
            <p className="text-xs text-red-600">
              NFT minting not configured (missing collection ID or IPFS key)
            </p>
          )}
          
          {hasTestableImage && canMint && (
            <p className="text-xs text-green-600">
              🧪 Ready to test NFT minting on Paseo testnet
            </p>
          )}
          
          {!hasTestableImage && (
            <p className="text-xs text-muted-foreground">
              Upload an image to test NFT minting
            </p>
          )}
          
          {isGenerating && (
            <p className="text-xs text-primary">
              🎨 Creating your unique avatar...
            </p>
          )}
        </div>
      </CardContent>
      
      {/* Minting Progress Modal */}
      <Dialog open={showMintingProgress} onOpenChange={setShowMintingProgress}>
        <DialogContent className="sm:max-w-md">
          <MintingProgress 
            progress={mintingProgress}
            onClose={mintingProgress.step === 'finalized' || mintingProgress.step === 'error' ? handleCloseProgress : undefined}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}