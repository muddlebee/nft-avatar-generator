# NFT Avatar Generator Implementation Plan

Based on my analysis of your codebase and the PRD, here's a comprehensive plan to implement the NFT Avatar Generator as a mockup UI first, then extend it with API functionality.

## **Phase 1: Mockup UI Implementation**

### **Project Structure**
Following your existing patterns, I'll create:
```
app/avatar-generator/
  └── page.tsx                    # Main page
components/avatar-generator/
  ├── upload-card.tsx            # Drag & drop upload
  ├── trait-sidebar.tsx          # Trait selection panel  
  ├── preview-pane.tsx           # Main preview area
  ├── variant-grid.tsx           # Generated variants display
  ├── action-bar.tsx             # Generate/Lock/Mint buttons
  └── types.ts                   # TypeScript interfaces
lib/avatar-generator/
  ├── traits-config.ts           # Trait categories & options
  └── prompt-builder.ts          # Prompt template logic
```

### **UI Components Design**

**Layout**: Split-screen design optimized for desktop and mobile
- **Left**: Upload + Trait Sidebar (collapsible on mobile)
- **Right**: Preview Pane + Action Bar
- Uses your existing `Card` components and design system

**Key Features**:
1. **Upload Card**: Drag-drop with preview, file validation (JPG/PNG, ≤5MB)
2. **Trait Sidebar**: Radio buttons for each category + Randomize button
3. **Preview Pane**: Large preview area with variant thumbnails below
4. **Action Bar**: Generate/Lock/Mint buttons with proper states

### **State Management**
Using React state with proper TypeScript interfaces:
```typescript
interface AvatarGeneratorState {
  baseImage: string | null;
  selectedTraits: TraitSelection;
  variants: GeneratedVariant[];
  isGenerating: boolean;
  lockedVariant: GeneratedVariant | null;
}
```

### **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Collapsible sidebar on mobile
- Stacked layout for smaller screens
- Touch-friendly controls

## **Phase 2: Polkadot Integration**

### **Wallet Connection**
Your existing infrastructure is perfect:
- `SelectedAccountProvider` for account management
- `TxButton` component for transaction handling
- `useTxWithFees` hook for fee estimation

### **NFT Minting Flow**
1. **Asset Hub Integration**: Use Asset Hub for NFT creation
2. **IPFS Storage**: Upload metadata and images to IPFS
3. **Transaction Building**: Create NFT mint transaction
4. **Fee Estimation**: Show fees before minting
5. **Signature Flow**: Use existing `TxButton` pattern

### **Mint Button Integration**
```typescript
// Will use your existing TxButton pattern
<TxButton
  tx={mintNftTx}
  disabled={!lockedVariant}
  className="w-full"
>
  Mint NFT
</TxButton>
```
