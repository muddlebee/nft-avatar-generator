# 🧪 Testing Mode Configuration - NFT Minting

## 📝 **Overview**

The NFT minting feature now supports **two modes** controlled by an environment variable:

- **Testing Mode** (`NEXT_PUBLIC_ENABLE_TESTING_MODE=true`): Mint NFTs with any uploaded image
- **Production Mode** (`NEXT_PUBLIC_ENABLE_TESTING_MODE=false`): Require AI-generated and locked variants

This allows easy testing without avatar generation while maintaining the proper production flow.

---

## 🎛️ **Configuration**

### **Environment Variable**

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_ENABLE_TESTING_MODE=true   # Enable testing mode
# or
NEXT_PUBLIC_ENABLE_TESTING_MODE=false  # Production mode (default)
```

### **How It Works**

The flag is checked in `components/avatar-generator/preview-pane.tsx`:

```typescript
const isTestingMode = process.env.NEXT_PUBLIC_ENABLE_TESTING_MODE === 'true';

// In testing mode: allow minting with any uploaded image
// In production mode: require locked variant from AI generation
const canMint = isTestingMode 
  ? (hasTestableImage && polkadotAccount && isConfigured)
  : (lockedVariant && polkadotAccount && isConfigured);
```

### **Mode Comparison**

| Feature | Testing Mode | Production Mode |
|---------|-------------|----------------|
| **Image Source** | Any uploaded image | AI-generated + locked variant |
| **UI Banner** | 🧪 Blue "Testing Mode" banner | No banner |
| **Button Text** | "Test Mint NFT on Paseo" | "Mint NFT on Paseo" |
| **Traits** | Uses default traits if no variant | Requires generated variant traits |
| **Use Case** | Development & testing | End-user production |

---

## 🎯 **Testing Mode Flow**

### **When `NEXT_PUBLIC_ENABLE_TESTING_MODE=true`:**

1. **Upload any image** to the avatar generator
2. **Connect Polkadot wallet** (with PAS tokens)
3. **Click "Test Mint NFT on Paseo"** button
4. **Complete minting flow** with progress tracking
5. **Get NFT** with the uploaded image and default traits

### **Visual Indicators:**
- 🧪 Blue banner: "Testing Mode: Mint NFT with uploaded image"
- Button text: "Test Mint NFT on Paseo"
- Status messages indicate testing context

---

## 🎯 **Production Mode Flow**

### **When `NEXT_PUBLIC_ENABLE_TESTING_MODE=false` (or unset):**

1. **Upload image** → Generate variants → **Lock variant** → Connect wallet → **Mint NFT**
2. Only locked variants can be minted
3. Users must go through the complete generation flow
4. No testing mode indicators
5. Button text: "Mint NFT on Paseo"

---

## 🔄 **Switching Between Modes**

### **Enable Testing Mode:**
```bash
# .env.local
NEXT_PUBLIC_ENABLE_TESTING_MODE=true
```
Then restart your Next.js dev server: `pnpm dev`

### **Enable Production Mode:**
```bash
# .env.local
NEXT_PUBLIC_ENABLE_TESTING_MODE=false
```
Or simply remove/comment out the line. Then restart your dev server.

---

## 🔍 **Files Modified**

### **New Files:**
- **`.env.example`** - Environment variable documentation and template

### **Modified Files:**
- **`components/avatar-generator/preview-pane.tsx`** - Implements feature flag logic
  - Checks `process.env.NEXT_PUBLIC_ENABLE_TESTING_MODE`
  - Conditionally renders UI based on mode
  - Handles image/trait selection based on mode

---

## 💡 **Implementation Details**

### **Key Code Sections:**

**1. Mode Detection:**
```typescript
const isTestingMode = process.env.NEXT_PUBLIC_ENABLE_TESTING_MODE === 'true';
```

**2. Conditional Minting Logic:**
```typescript
const canMint = isTestingMode 
  ? (hasTestableImage && polkadotAccount && isConfigured)
  : (lockedVariant && polkadotAccount && isConfigured);
```

**3. Image & Traits Selection:**
```typescript
const imageToMint = isTestingMode 
  ? (lockedVariant?.url || selectedVariant?.url || baseImage)
  : lockedVariant?.url;

const traitsToUse = isTestingMode
  ? (lockedVariant?.traits || selectedVariant?.traits || defaultTraits)
  : (lockedVariant?.traits || defaultTraits);
```

**4. Conditional UI Rendering:**
```typescript
{(isTestingMode ? hasTestableImage : lockedVariant) && (
  // Mint button and controls
)}
```

---

## ⚠️ **Important Notes**

- **Environment variables require server restart** - Changes to `.env.local` won't take effect until you restart `pnpm dev`
- **Default traits are used** when minting base images in testing mode (since no generation occurred)
- **Testing mode is visually indicated** with blue banners and different button text
- **Production deployments** should set `NEXT_PUBLIC_ENABLE_TESTING_MODE=false` or omit it entirely
- **The feature is now production-ready** - no temporary code or comments to revert
