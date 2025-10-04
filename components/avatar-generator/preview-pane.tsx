"use client";

import { Download, Sparkles, Wand2, Coins, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWallets } from "@kheopskit/react";
import { useNFTMinting } from "@/hooks/use-nft-minting";
import Image from "next/image";
import { useSelectedPolkadotAccount, useSelectedAccount } from "@/hooks/use-selected-account";
import { PolkadotAccountStatus } from "@/components/account/selected-account-status";
import { MintingProgress } from "./minting-progress";
import type { PreviewPaneProps, MintingProgress as MintingProgressType, TraitSelection } from "./types";

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
  const selectedPolkadotAccount = useSelectedPolkadotAccount();
  const { isLoading: isAccountLoading, isClientReady } = useSelectedAccount();
  const { mintNFT, isConfigured, configStatus } = useNFTMinting();
  
  const [showMintingProgress, setShowMintingProgress] = useState(false);
  const [mintingProgress, setMintingProgress] = useState<MintingProgressType>({
    step: 'idle',
    message: '',
    progress: 0
  });

  const selectedVariant = lockedVariant || variants[0];
  
  // Feature flag: Enable testing mode via environment variable
  const isTestingMode = process.env.NEXT_PUBLIC_ENABLE_TESTING_MODE === 'true';
  
  // In testing mode: allow minting with any uploaded image
  // In production mode: require generated variant
  const hasTestableImage = baseImage || selectedVariant;
  const hasMintableImage = isTestingMode ? hasTestableImage : selectedVariant;
  const canMint = hasMintableImage && selectedPolkadotAccount && isConfigured && !isAccountLoading && isClientReady;

  // Cleanup minting state on component unmount
  useEffect(() => {
    return () => {
      // Reset minting state if component unmounts during minting
      setMintingProgress(prev => {
        if (prev.step !== 'idle' && prev.step !== 'finalized') {
          return {
            step: 'idle',
            message: '',
            progress: 0
          };
        }
        return prev;
      });
    };
  }, []);

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
    // Check if wallet is still loading
    if (isAccountLoading || !isClientReady) {
      console.warn('Wallet is still loading, please wait...');
      return;
    }

    // Check if we have a Polkadot account selected
    if (!selectedPolkadotAccount) {
      console.error('No Polkadot account selected. Please select an account first.');
      return;
    }

    if (!canMint) {
      console.log('DEBUG: Cannot mint - canMint is false');
      return;
    }

    // Determine image and traits based on mode
    const imageToMint = isTestingMode 
      ? (selectedVariant?.url || baseImage)
      : selectedVariant?.url;
    
    const defaultTraits = {
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
    
    const traitsToUse = selectedVariant?.traits || defaultTraits;
    const seedToUse = selectedVariant?.seed || Math.floor(Math.random() * 10000);

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
        traitsToUse, // Guaranteed to be defined via defaultTraits fallback
        seedToUse,
        setMintingProgress
      );
      
      console.log('NFT minted successfully:', result);
    } catch (error) {
      console.error('NFT minting failed:', error);
      
      // Ensure error state is set in the progress
      setMintingProgress({
        step: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const resetMintingState = () => {
    setMintingProgress({
      step: 'idle',
      message: '',
      progress: 0
    });
  };

  const handleCloseProgress = () => {
    setShowMintingProgress(false);
    resetMintingState();
  };

  // Prevent dialog from closing while minting is in progress
  const handleDialogOpenChange = (open: boolean) => {
    // Only allow closing if minting is not in progress or has finished
    if (!open) {
      const isInProgress = mintingProgress.step !== 'idle' && 
                          mintingProgress.step !== 'finalized' && 
                          mintingProgress.step !== 'error';
      
      if (isInProgress) {
        // Don't close the dialog while minting
        return;
      }
      
      // Reset state when closing
      resetMintingState();
    }
    
    setShowMintingProgress(open);
  };

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
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
              <Image
                src={baseImage}
                alt="Base avatar"
                fill
                className="object-contain bg-muted/20"
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
              <Image
                src={selectedVariant.url}
                alt="Generated avatar"
                fill
                className="object-cover"
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
        <div className="space-y-3">
          {/* Generate/Regenerate and Download Buttons - Horizontal Layout */}
          {hasVariants ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onGenerate}
                disabled={!canGenerate || isGenerating}
                size="lg"
                variant="secondary"
                className="flex items-center gap-2"
              >
                {getGenerateButtonIcon()}
                Regenerate
              </Button>

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
            </div>
          ) : (
            <Button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              size="lg"
              className="w-full flex items-center gap-2"
            >
              {getGenerateButtonIcon()}
              {getGenerateButtonText()}
            </Button>
          )}

          {/* Mint NFT Section - Conditional based on mode */}
          {hasMintableImage && (
            <div className="space-y-3 pt-2 border-t">
              {/* Testing Mode Banner - Only show in testing mode */}
              {isTestingMode && (
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
                    🧪 Testing Mode
                  </p>
                </div>
              )}
              
              {/* Account Status */}
              <PolkadotAccountStatus compact={true} />
              
              <Button
                onClick={handleMintNFT}
                disabled={!canMint || mintingProgress.step !== 'idle' || isAccountLoading || !isClientReady}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
              >
                <Coins className="w-4 h-4 mr-2" />
                {isAccountLoading || !isClientReady 
                  ? 'Loading Wallet...' 
                  : mintingProgress.step !== 'idle' 
                    ? 'Minting...' 
                    : isTestingMode 
                      ? 'Test Mint NFT on Paseo'
                      : 'Mint NFT on Paseo'
                }
              </Button>
              
              {!selectedPolkadotAccount && (
                <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
                  Select a Polkadot account to mint NFTs
                </p>
              )}
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
          
          {/* Mode-specific status messages */}
          {isTestingMode && hasTestableImage && !selectedPolkadotAccount && (
            <p className="text-xs text-amber-600">
              Connect a Polkadot wallet to test NFT minting
            </p>
          )}
          
          {isTestingMode && hasTestableImage && selectedPolkadotAccount && !isConfigured && (
            <p className="text-xs text-red-600">
              NFT minting not configured (missing collection ID or IPFS key)
            </p>
          )}
          
          {isTestingMode && hasTestableImage && canMint && (
            <p className="text-xs text-green-600">
              🧪 Ready to test NFT minting on Paseo testnet
            </p>
          )}
          
          {isTestingMode && !hasTestableImage && (
            <p className="text-xs text-muted-foreground">
              Upload an image to test NFT minting
            </p>
          )}
          
          {!isTestingMode && hasVariants && canMint && (
            <p className="text-xs text-green-600">
              Ready to mint NFT on Paseo testnet
            </p>
          )}
          
          {!isTestingMode && !hasVariants && baseImage && (
            <p className="text-xs text-muted-foreground">
              Generate an avatar to enable NFT minting
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
      <Dialog open={showMintingProgress} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Minting Progress</DialogTitle>
          <MintingProgress 
            progress={mintingProgress}
            onClose={mintingProgress.step === 'finalized' || mintingProgress.step === 'error' ? handleCloseProgress : undefined}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}