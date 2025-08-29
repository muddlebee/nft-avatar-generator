"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UploadCard } from "./upload-card";
import { TraitSidebar } from "./trait-sidebar";
import { PreviewPane } from "./preview-pane";
import { DEFAULT_TRAITS, getRandomTraits } from "@/lib/avatar-generator/traits-config";
import { buildPrompt, generateSeeds } from "@/lib/avatar-generator/prompt-builder";
import type { AvatarGeneratorState, GeneratedVariant, TraitSelection } from "./types";

// Interface for API response
interface GenerateAvatarResponse {
  success: boolean;
  variant?: GeneratedVariant;
  error?: string;
}

export function AvatarGeneratorClient() {
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<AvatarGeneratorState>({
    baseImage: "/swush.png",
    baseImageFile: null,
    selectedTraits: DEFAULT_TRAITS,
    variants: [],
    isGenerating: false,
    lockedVariant: null,
    uploadError: null,
  });

  // Referral code state
  const [referralCode, setReferralCode] = useState("");
  const [referralCodeValidated, setReferralCodeValidated] = useState(false);
  const [referralCodeTier, setReferralCodeTier] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [wasAutoApplied, setWasAutoApplied] = useState(false);

  const canGenerate = useMemo(() => {
    return !!state.baseImage && !state.isGenerating && referralCodeValidated && attemptsUsed < maxAttempts;
  }, [state.baseImage, state.isGenerating, referralCodeValidated, attemptsUsed, maxAttempts]);

  const handleImageUpload = useCallback((file: File | null, dataUrl: string) => {
    if (!file) {
      setState(prev => ({
        ...prev,
        baseImage: null,
        baseImageFile: null,
        variants: [],
        lockedVariant: null,
        uploadError: null,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      baseImage: dataUrl,
      baseImageFile: file,
      variants: [],
      lockedVariant: null,
      uploadError: null,
    }));
  }, []);

  const handleTraitChange = useCallback((category: keyof TraitSelection, value: string) => {
    setState(prev => ({
      ...prev,
      selectedTraits: {
        ...prev.selectedTraits,
        [category]: value,
      },
    }));
  }, []);

  const handleRandomize = useCallback(() => {
    if (state.isGenerating) return;
    
    setState(prev => ({
      ...prev,
      selectedTraits: getRandomTraits(),
    }));
  }, [state.isGenerating]);

  // Simple referral code validation with local storage
  const validateReferralCode = useCallback((code: string) => {
    const validCodes = {
      'X7K9M2P': { tier: 'Tier 2', maxAttempts: 2 },
      'HS2345': { tier: 'Tier 2', maxAttempts: 2 },
      'R4N8Q1L': { tier: 'Tier 3', maxAttempts: 3 },
      'B5W3H7J': { tier: 'Tier 5', maxAttempts: 5 },
      'F9D6S2V': { tier: 'VIP', maxAttempts: 5 },
      'K8M4Z1X': { tier: 'Hackathon', maxAttempts: 3 },
      'T2L7N9Q': { tier: 'Early Access', maxAttempts: 2 }
    };

    const codeInfo = validCodes[code as keyof typeof validCodes];
    if (codeInfo) {
      // Check if user has already used this code
      const storageKey = `referral_${code}`;
      const stored = localStorage.getItem(storageKey);
      const attempts = stored ? parseInt(stored) : 0;
      
      if (attempts < codeInfo.maxAttempts) {
        setReferralCode(code);
        setReferralCodeValidated(true);
        setReferralCodeTier(codeInfo.tier);
        setMaxAttempts(codeInfo.maxAttempts);
        setAttemptsUsed(attempts);
        return true;
      } else {
        // Code is exhausted - don't validate it
        alert(`Rate limit exceeded! You've used ${attempts}/${codeInfo.maxAttempts} attempts with this code.`);
        setReferralCode("");
        setReferralCodeValidated(false);
        setReferralCodeTier("");
        setMaxAttempts(0);
        setAttemptsUsed(0);
        return false;
      }
    } else {
      alert('Invalid referral code. Please try again.');
      return false;
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    // Check rate limit before generation
    const storageKey = `referral_${referralCode}`;
    const currentAttempts = parseInt(localStorage.getItem(storageKey) || '0');
    
    if (currentAttempts >= maxAttempts) {
      alert(`Rate limit exceeded! You've used ${currentAttempts}/${maxAttempts} attempts.`);
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, lockedVariant: null }));

    try {
      // Build prompt for logging/debugging
      const prompt = buildPrompt(state.selectedTraits);
      console.log("Generated prompt:", prompt);

      // Call the Gemini API through our Next.js API route
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traits: state.selectedTraits,
          baseImage: state.baseImage, // Include base image for future enhancements
        }),
      });

      const data: GenerateAvatarResponse = await response.json();

      if (!data.success || !data.variant) {
        throw new Error(data.error || 'Failed to generate avatar');
      }

      // Update state with the generated variant
      setState(prev => ({
        ...prev,
        variants: [data.variant!],
        isGenerating: false,
        uploadError: null,
      }));

      // Increment usage count after successful generation
      const newAttempts = currentAttempts + 1;
      localStorage.setItem(storageKey, newAttempts.toString());
      setAttemptsUsed(newAttempts);
      
      // Show remaining attempts
      const remaining = maxAttempts - newAttempts;
      if (remaining > 0) {
        console.log(`Avatar generated! ${remaining} attempts remaining.`);
      } else {
        console.log('Avatar generated! No attempts remaining.');
      }

    } catch (error) {
      console.error('Avatar generation failed:', error);
      setState(prev => ({
        ...prev,
        variants: [],
        isGenerating: false,
        uploadError: error instanceof Error ? error.message : 'Failed to generate avatar. Please try again.',
      }));
    }
  }, [canGenerate, state.selectedTraits, state.baseImage]);

  const handleVariantSelect = useCallback((variant: GeneratedVariant) => {
    // For now, just log the selection
    console.log("Selected variant:", variant);
  }, []);

  const handleLock = useCallback(() => {
    if (state.variants.length === 0) return;
    
    const firstVariant = state.variants[0];
    setState(prev => ({
      ...prev,
      lockedVariant: firstVariant,
    }));
  }, [state.variants]);

  const handleMint = useCallback(() => {
    if (!state.lockedVariant) return;
    
    // This will be connected to Polkadot minting in Phase 2
    console.log("Minting NFT:", {
      variant: state.lockedVariant,
      traits: state.selectedTraits,
      baseImage: state.baseImageFile?.name,
    });
    
    // Show success message or redirect
    alert("NFT minting will be implemented in Phase 2!");
  }, [state.lockedVariant, state.selectedTraits, state.baseImageFile]);

  // Auto-apply referral code from URL parameters
  useEffect(() => {
    const urlRefCode = searchParams.get('refCode');
    
    if (urlRefCode && !referralCodeValidated) {
      console.log(`Auto-applying referral code from URL: ${urlRefCode}`);
      // Auto-validate the referral code from URL
      const success = validateReferralCode(urlRefCode);
      
      if (success) {
        setWasAutoApplied(true);
        console.log(`✓ Referral code ${urlRefCode} auto-applied successfully`);
        
        // Clean up URL after successful validation to prevent re-application
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('refCode');
          window.history.replaceState({}, '', url.toString());
        }
      } else {
        console.log(`✗ Failed to auto-apply referral code: ${urlRefCode}`);
      }
    }
  }, [searchParams, referralCodeValidated, validateReferralCode]);

  // Convert pre-loaded image to data URL for API compatibility
  useEffect(() => {
    const convertImageToDataUrl = async () => {
      try {
        const response = await fetch('/swush.png');
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setState(prev => ({
            ...prev,
            baseImage: dataUrl,
          }));
        };
        
        reader.onerror = () => {
          console.error('Failed to read image file');
          // Fallback to original path if conversion fails
          setState(prev => ({
            ...prev,
            baseImage: '/swush.png',
          }));
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to convert pre-loaded image to data URL:', error);
        // Keep the original path if conversion fails
        setState(prev => ({
          ...prev,
          baseImage: '/swush.png',
        }));
      }
    };

    // Only convert if we have the default image path
    if (state.baseImage === '/swush.png') {
      convertImageToDataUrl();
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column - Controls */}
      <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
        <UploadCard
          baseImage={state.baseImage}
          onImageUpload={handleImageUpload}
          uploadError={state.uploadError}
          isGenerating={state.isGenerating}
          referralCode={referralCode}
          referralCodeValidated={referralCodeValidated}
          referralCodeTier={referralCodeTier}
          maxAttempts={maxAttempts}
          attemptsUsed={attemptsUsed}
          wasAutoApplied={wasAutoApplied}
          onReferralCodeValidate={validateReferralCode}
        />
        
        <TraitSidebar
          selectedTraits={state.selectedTraits}
          onTraitChange={handleTraitChange}
          onRandomize={handleRandomize}
          isGenerating={state.isGenerating}
        />
      </div>

      {/* Right Column - Preview & Actions */}
      <div className="lg:col-span-3 order-1 lg:order-2">
        <PreviewPane
          baseImage={state.baseImage}
          variants={state.variants}
          lockedVariant={state.lockedVariant}
          onVariantSelect={handleVariantSelect}
          isGenerating={state.isGenerating}
          canGenerate={canGenerate}
          hasVariants={state.variants.length > 0}
          onGenerate={handleGenerate}
          onLock={handleLock}
          onMint={handleMint}
          referralCodeValidated={referralCodeValidated}
          referralCodeTier={referralCodeTier}
          attemptsUsed={attemptsUsed}
          maxAttempts={maxAttempts}
        />
      </div>
    </div>
  );
}
