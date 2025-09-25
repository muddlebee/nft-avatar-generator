# 🧪 Testing Mode Changes - NFT Minting

## 📝 **What Was Changed for Testing**

To enable testing the complete NFT minting flow without requiring avatar generation, the following temporary changes were made to `components/avatar-generator/preview-pane.tsx`:

### **Changes Made:**

1. **Enable Minting with Base Image**
   ```typescript
   // BEFORE: Only allow minting with locked variants
   const canMint = lockedVariant && polkadotAccount && isConfigured;
   
   // AFTER: Allow minting with any uploaded image
   const hasTestableImage = baseImage || selectedVariant;
   const canMint = hasTestableImage && polkadotAccount && isConfigured;
   ```

2. **Updated Mint Handler**
   ```typescript
   // Added fallback logic to use base image or default traits
   const imageToMint = lockedVariant?.url || selectedVariant?.url || baseImage;
   const traitsToUse = lockedVariant?.traits || selectedVariant?.traits || {
     headgear: 'None',
     accessory: 'None', 
     clothing: 'Default',
     // ... default traits
   };
   ```

3. **Show Mint Button for Any Image**
   ```typescript
   // BEFORE: Only show for locked variants
   {lockedVariant && (
   
   // AFTER: Show for any uploaded image
   {hasTestableImage && (
   ```

4. **Added Testing Mode UI**
   - Blue banner indicating "Testing Mode"
   - Button text changed to "Test Mint NFT on Paseo"
   - Updated status messages for testing context

---

## 🎯 **Current Testing Flow**

1. **Upload any image** to the avatar generator
2. **Connect Polkadot wallet** (with PAS tokens)
3. **Click "Test Mint NFT on Paseo"** button
4. **Complete minting flow** with progress tracking
5. **Get NFT** with the uploaded image and default traits

---

## 🔄 **How to Revert Back to Production Mode**

When ready to revert to the original flow (lock variant required), make these changes to `components/avatar-generator/preview-pane.tsx`:

### **1. Revert Minting Logic**
```typescript
// Change this:
const hasTestableImage = baseImage || selectedVariant;
const canMint = hasTestableImage && polkadotAccount && isConfigured;

// Back to this:
const canMint = lockedVariant && polkadotAccount && isConfigured;
```

### **2. Revert Mint Handler**
```typescript
// Change this:
const handleMintNFT = async () => {
  if (!canMint) return;
  
  const imageToMint = lockedVariant?.url || selectedVariant?.url || baseImage;
  const traitsToUse = lockedVariant?.traits || selectedVariant?.traits || { /* defaults */ };
  // ...
};

// Back to this:
const handleMintNFT = async () => {
  if (!lockedVariant || !canMint) return;
  
  const result = await mintNFT(
    lockedVariant.url,
    lockedVariant.traits,
    lockedVariant.seed,
    setMintingProgress
  );
  // ...
};
```

### **3. Revert Button Display**
```typescript
// Change this:
{hasTestableImage && (
  <div className="space-y-2">
    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-700 text-center font-medium">
        🧪 Testing Mode: Mint NFT with uploaded image
      </p>
    </div>
    <Button>Test Mint NFT on Paseo</Button>
  </div>
)}

// Back to this:
{lockedVariant && (
  <Button>Mint NFT on Paseo</Button>
)}
```

### **4. Revert Status Messages**
```typescript
// Change this:
{hasTestableImage && !polkadotAccount && (
  <p>Connect a Polkadot wallet to test NFT minting</p>
)}
{hasTestableImage && canMint && (
  <p>🧪 Ready to test NFT minting on Paseo testnet</p>
)}

// Back to this:
{hasVariants && !lockedVariant && (
  <p>Lock a variant to enable NFT minting</p>
)}
{lockedVariant && canMint && (
  <p>Ready to mint NFT on Paseo testnet</p>
)}
```

---

## 🔍 **Files Modified**

- **`components/avatar-generator/preview-pane.tsx`** - Main component with testing changes

**All changes are marked with `// TEMPORARY:` comments for easy identification.**

---

## 🎯 **Original Production Flow**

1. **Upload image** → Generate variants → **Lock variant** → Connect wallet → **Mint NFT**
2. Only locked variants can be minted
3. Users must go through the complete generation flow
4. No testing mode indicators

---

## ⚠️ **Important Notes**

- **All testing changes are temporary** and should be reverted before production
- **Search for `// TEMPORARY:` comments** to find all modified sections
- **Default traits are used** when minting base images (since no generation occurred)
- **Testing mode is visually indicated** with blue banners and different button text

**Remember to revert these changes once testing is complete!**
