import { TraitCategory, TraitSelection } from "@/components/avatar-generator/types";

export const TRAIT_CATEGORIES: TraitCategory[] = [
  {
    key: "headgear",
    label: "Headgear",
    options: ["beanie", "samurai helmet", "crown", "cap", "headphones", "witch hat", "baseball cap", "bandana"]
  },
  {
    key: "accessory", 
    label: "Face Accessory",
    options: ["round glasses", "visor", "halo", "sunglasses", "eyepatch", "mustache", "cigarette", "tattoo"]
  },
  {
    key: "clothing",
    label: "Clothing", 
    options: ["hoodie", "leather jacket", "wizard robe", "armor", "t-shirt", "formal suit", "kimono", "lab coat"]
  },
  {
    key: "expression",
    label: "Expression",
    options: ["neutral", "smirk", "determined", "happy", "serious", "playful", "angry", "surprised"]
  },
/*   {
    key: "special",
    label: "Special Features",
    options: ["none", "wings", "aura", "glow", "sparkles", "shadow", "fire", "ice"]
  }, */
  {
    key: "weapon",
    label: "Weapon/Equipment",
    options: ["sword", "staff", "gun", "bow", "shield", "magic orb", "dagger", "axe"]
  }
];

export const DEFAULT_TRAITS: TraitSelection = {
  headgear: "cap",
  accessory: "round glasses", 
  clothing: "hoodie",
  background: "plain gradient",
  expression: "playful",
  hair: "short",
  skin: "medium",
  special: "wings",
  weapon: "magic orb"
};

export function getRandomTraits(): TraitSelection {
  const randomTraits: TraitSelection = {} as TraitSelection;
  
  TRAIT_CATEGORIES.forEach(category => {
    const options = category.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    randomTraits[category.key as keyof TraitSelection] = options[randomIndex];
  });
  
  return randomTraits;
}

