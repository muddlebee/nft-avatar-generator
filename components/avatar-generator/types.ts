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
  variants: MintableVariant[];  // Updated to use MintableVariant
  isGenerating: boolean;
  lockedVariant: MintableVariant | null;  // Updated to use MintableVariant
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

// NFT and IPFS related types
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // ipfs://CID
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    model: string;
    seed: number;
    prompt_sha256: string;
    generator: string;
    created_at: string;
  };
}

export interface IPFSUploadResult {
  imageCID: string;
  metadataCID: string;
  metadata: NFTMetadata;
  imageGatewayUrl: string;
  metadataGatewayUrl: string;
}

// NFT Minting progress and result types
export interface MintingProgress {
  step: 'idle' | 'uploading-image' | 'uploading-metadata' | 'getting-item-id' | 'creating-transaction' | 'signing' | 'broadcasting' | 'in-block' | 'finalized' | 'error';
  message: string;
  progress: number; // 0-100
  txHash?: string;
  blockHash?: string;
  itemId?: number;
  error?: string;
  ipfsData?: {
    imageCID: string;
    metadataCID: string;
    imageGatewayUrl: string;
    metadataGatewayUrl: string;
  };
}

export interface MintingResult {
  success: boolean;
  itemId?: number;
  txHash?: string;
  blockHash?: string;
  error?: string;
  ipfsData?: {
    imageCID: string;
    metadataCID: string;
    imageGatewayUrl: string;
    metadataGatewayUrl: string;
  };
}

export interface MintableVariant extends GeneratedVariant {
  mintingProgress?: MintingProgress;
  mintingResult?: MintingResult;
  isMinting?: boolean;
}

export interface PreviewPaneProps {
  baseImage: string | null;
  variants: MintableVariant[];  // Updated to use MintableVariant
  lockedVariant: MintableVariant | null;  // Updated to use MintableVariant
  onVariantSelect: (variant: MintableVariant) => void;  // Updated to use MintableVariant
  isGenerating: boolean;
  canGenerate: boolean;
  hasVariants: boolean;
  onGenerate: () => void;
  onLock: () => void;
  onMint: (variant: MintableVariant) => Promise<void>;  // Updated signature for async minting
  referralCodeValidated: boolean;
  referralCodeTier: string;
  attemptsUsed: number;
  maxAttempts: number;
}


