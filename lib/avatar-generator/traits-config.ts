import { TraitCategory, TraitSelection } from "@/components/avatar-generator/types";

export const TRAIT_CATEGORIES: TraitCategory[] = [
  {
    key: "headgear",
    label: "Headgear",
    options: ["none", "beanie", "samurai helmet", "crown", "cap", "bandana"]
  },
  {
    key: "accessory", 
    label: "Face Accessory",
    options: ["none", "round glasses", "visor", "halo", "sunglasses", "monocle"]
  },
  {
    key: "clothing",
    label: "Clothing", 
    options: ["hoodie", "leather jacket", "wizard robe", "armor", "t-shirt", "formal suit"]
  },
  {
    key: "expression",
    label: "Expression",
    options: ["neutral", "smirk", "determined", "happy", "serious", "playful"]
  },
  {
    key: "special",
    label: "Special Features",
    options: ["none", "wings", "aura", "glow", "sparkles", "shadow", "fire", "ice"]
  },
  {
    key: "weapon",
    label: "Weapon/Equipment",
    options: ["none", "sword", "staff", "gun", "bow", "shield", "magic orb", "dagger"]
  }
];

export const DEFAULT_TRAITS: TraitSelection = {
  headgear: "none",
  accessory: "none", 
  clothing: "hoodie",
  background: "plain gradient",
  expression: "neutral",
  hair: "short",
  skin: "medium",
  special: "none",
  weapon: "none"
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

