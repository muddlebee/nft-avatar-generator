I'll analyze the codebase and create a plan to implement the NFT Avatar Generator based on the PRD. Let me first examine the current codebase structure and understand the existing components.

[6 tools called]

Perfect! Now I have a good understanding of the codebase. Let me also check the existing styling and theme system:

[2 tools called]

Now let me fetch the UI rules to understand the coding standards:

[1 tool called]

Perfect! Now I have a comprehensive understanding of the codebase. Let me create a detailed implementation plan for the NFT Avatar Generator.

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

## **Phase 3: API Implementation**

### **Next.js API Routes**
```
app/api/avatar-generator/
  ├── upload/route.ts           # POST - file upload
  ├── generate/route.ts         # POST - FLUX generation
  └── lock/route.ts             # POST - lock variant
```

### **FLUX-Kontext-Pro Integration**
- Image-to-image generation with trait-based prompts
- Configurable parameters (strength: 0.3-0.45, steps: 20-28)
- Multiple seed generation for variants

### **Error Handling & Loading States**
- Proper loading states during generation
- Error boundaries for API failures
- Retry mechanisms for failed generations

## **Implementation Benefits**

### **Leverages Existing Codebase**
- **Design System**: Uses your Shadcn UI components and theme
- **Wallet Integration**: Builds on existing account/transaction infrastructure  
- **TypeScript**: Follows your strict typing patterns
- **Performance**: Server components where possible, client only for interactivity

### **Scalable Architecture**
- **Modular Components**: Each component has a single responsibility
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Configuration-Driven**: Easy to add new traits or modify prompts
- **API-Ready**: Clean separation between UI and generation logic

### **User Experience**
- **Progressive Enhancement**: Works without wallet connection for preview
- **Responsive**: Mobile-optimized interface
- **Accessibility**: Proper focus management and screen reader support
- **Performance**: Lazy loading, optimized images, minimal client-side code

## **Next Steps**

1. **Start with Upload Card**: Create the file upload component with drag-drop
2. **Build Trait Sidebar**: Implement trait selection with your existing UI components
3. **Add Preview Area**: Create the main preview pane with placeholder variants
4. **Connect State**: Wire up all components with proper state management
5. **Style & Polish**: Apply your design system and ensure responsive behavior

Would you like me to start implementing any specific component, or would you prefer to see the complete mockup first? I can begin with the main page layout and work through each component systematically.