"use client";

import { useState, useCallback, useMemo } from "react";
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
  const [state, setState] = useState<AvatarGeneratorState>({
    baseImage: "/swush.png",
    baseImageFile: null,
    selectedTraits: DEFAULT_TRAITS,
    variants: [],
    isGenerating: false,
    lockedVariant: null,
    uploadError: null,
  });

  const canGenerate = useMemo(() => {
    return !!state.baseImage && !state.isGenerating;
  }, [state.baseImage, state.isGenerating]);

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

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column - Controls */}
      <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
        <UploadCard
          baseImage={state.baseImage}
          onImageUpload={handleImageUpload}
          uploadError={state.uploadError}
          isGenerating={state.isGenerating}
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
        />
      </div>
    </div>
  );
}
