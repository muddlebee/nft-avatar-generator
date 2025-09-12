import { TraitSelection } from "@/components/avatar-generator/types";
import { TRAIT_CATEGORIES } from "./traits-config";

const BASE_PROMPT = "character wearing a ";
const NEGATIVE_PROMPT = "blurry, overexposed, low quality, watermark, text, signature, distorted, malformed";

export function buildPrompt(traits: TraitSelection): string {
  const traitParts: string[] = [];
  
  // Only process traits from selectable categories
  TRAIT_CATEGORIES.forEach(category => {
    const traitValue = traits[category.key as keyof TraitSelection];
    
    if (traitValue && traitValue !== "none") {
      traitParts.push(traitValue);
    }
  });
  
  // Combine base prompt with traits
  let fullPrompt = BASE_PROMPT;
  if (traitParts.length > 0) {
    fullPrompt += `${traitParts.join(", ")}`;
  }
  
  return fullPrompt;
}

export function getNegativePrompt(): string {
  return NEGATIVE_PROMPT;
}

export function generateSeeds(count: number = 4): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10000));
}

