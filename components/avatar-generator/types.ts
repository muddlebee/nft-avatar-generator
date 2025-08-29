export interface TraitCategory {
  key: string;
  label: string;
  options: string[];
}

export interface TraitSelection {
  headgear: string;
  accessory: string;
  clothing: string;
  background: string;
  expression: string;
  hair: string;
  skin: string;
  special: string;
  weapon: string;
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
}

export interface TraitSidebarProps {
  selectedTraits: TraitSelection;
  onTraitChange: (category: keyof TraitSelection, value: string) => void;
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
}


