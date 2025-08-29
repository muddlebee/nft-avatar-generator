import { TraitSelection } from "@/components/avatar-generator/types";

// const BASE_PROMPT = "cartoon avatar of a flame-headed character with big round black eyes, wearing a hoodie";
const BASE_PROMPT = "character wearing a ";
const NEGATIVE_PROMPT = "blurry, overexposed, low quality, watermark, text, signature, distorted, malformed";

export function buildPrompt(traits: TraitSelection): string {
  const traitParts: string[] = [];
  
  // Add traits to prompt, skipping "none" values
  if (traits.headgear && traits.headgear !== "none") {
    traitParts.push(traits.headgear);
  }
  
  if (traits.clothing && traits.clothing !== "hoodie") {
    // Replace default hoodie if different clothing selected
    traitParts.push(`wearing ${traits.clothing}`);
  }
  
  if (traits.accessory && traits.accessory !== "none") {
    traitParts.push(traits.accessory);
  }
  
  if (traits.background && traits.background !== "plain gradient") {
    traitParts.push(`${traits.background} background`);
  }
  
  if (traits.expression && traits.expression !== "neutral") {
    traitParts.push(traits.expression);
  }
  
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

