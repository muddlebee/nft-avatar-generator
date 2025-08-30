export interface TraitCategory {
  key: string;
  label: string;
  options: string[];
}

export interface TraitSelection {
  headgear: string | null;
  accessory: string | null;
  clothing: string | null;
  background: string | null;
  expression: string | null;
  hair: string | null;
  skin: string | null;
  special: string | null;
  weapon: string | null;
}

export interface GeneratedVariant {
  id: string;
  seed: number;
  url: string;
  traits: TraitSelection;
  isLocked?: boolean;
}

export interface AvatarGeneratorState {
  baseImage: string | null;
  baseImageFile: File | null;
  selectedTraits: TraitSelection;
  variants: GeneratedVariant[];
  isGenerating: boolean;
  lockedVariant: GeneratedVariant | null;
  uploadError: string | null;
}

export interface UploadCardProps {
  baseImage: string | null;
  onImageUpload: (file: File, dataUrl: string) => void;
  uploadError: string | null;
  isGenerating: boolean;
  referralCode: string;
  referralCodeValidated: boolean;
  referralCodeTier: string;
  maxAttempts: number;
  attemptsUsed: number;
  wasAutoApplied: boolean;
  onReferralCodeValidate: (code: string) => boolean;
}

export interface TraitSidebarProps {
  selectedTraits: TraitSelection;
  onTraitChange: (category: keyof TraitSelection, value: string | null) => void;
  onRandomize: () => void;
  isGenerating: boolean;
}

export interface PreviewPaneProps {
  baseImage: string | null;
  variants: GeneratedVariant[];
  lockedVariant: GeneratedVariant | null;
  onVariantSelect: (variant: GeneratedVariant) => void;
  isGenerating: boolean;
  canGenerate: boolean;
  hasVariants: boolean;
  onGenerate: () => void;
  onLock: () => void;
  onMint: () => void;
  referralCodeValidated: boolean;
  referralCodeTier: string;
  attemptsUsed: number;
  maxAttempts: number;
}


