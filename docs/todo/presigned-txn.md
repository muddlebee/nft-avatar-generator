# TODO : Change transaction flow for NFT minting

## Analysis of Current Flow vs Proposed Flow

### Current Flow:
1. **Server preparation** (0-60%): Upload image to IPFS, generate metadata, upload metadata to IPFS
2. **Client signing** (60-100%): Create transaction, sign transaction, broadcast, wait for finalization

### Proposed New Flow:
1. **User signs first** (0-30%): Create and sign transaction with placeholder metadata
2. **Upload to IPFS** (30-70%): Upload image and metadata to IPFS using the signed data
3. **Pallet sign** (70-100%): Execute the pre-signed transaction without re-signing

## Key Challenges and Considerations:

### 1. **Transaction Structure Issue**
The current transaction includes the metadata CID in the `set_metadata` call, but in the new flow, we need to sign before we have the IPFS CID. This creates a circular dependency.

### 2. **Possible Solutions**

**Option A: Two-Phase Transaction Approach**
- Phase 1: Sign a `mint` transaction only (without metadata)
- Phase 2: Upload to IPFS, then sign a separate `set_metadata` transaction
- Issue: This requires two signatures, not one as requested

**Option B: Predetermined CID Approach**
- Generate a deterministic item ID upfront
- Create metadata with placeholder content
- Calculate the IPFS CID beforehand (challenging with Lighthouse)
- Sign transaction with known CID
- Upload actual content to match the predetermined CID

**Option C: Modified Flow with Deferred Metadata**
- Sign only the `mint` transaction first
- Upload to IPFS after signing
- Use a separate call to set metadata (but this breaks the "no re-signing" requirement)

**Option D: Pre-computed Transaction with Hash Commitment**
- Generate a content hash of the image+traits upfront
- Sign transaction with a metadata pointer to this hash
- Upload to IPFS with the same content
- This ensures integrity but requires modifying the metadata structure

### 3. **Technical Limitations**

The fundamental issue is that **IPFS CIDs are content-addressable** - they're determined by the actual content. You can't know the CID until you upload the content, but you want to sign a transaction that references this CID before uploading.

## Recommended Approach

Given the constraints, I recommend **Option D with modifications**:

```typescript
// New flow structure:
1. Generate deterministic itemId and content hash (0-20%)
2. Create and sign transaction with predetermined metadata structure (20-40%) 
3. Upload image and metadata to IPFS (40-80%)
4. Execute pre-signed transaction using submitPreSigned (80-100%)
```

However, this requires:
- Modifying the metadata structure to use content hashes instead of direct IPFS references
- Using Polkadot's `submitPreSigned` functionality
- Ensuring the IPFS upload matches the signed commitment

## Would you like me to implement this approach?

The implementation would require:
1. Creating a new signing flow that separates signing from execution
2. Modifying the metadata structure 
3. Adding IPFS upload logic that works with pre-signed transactions
4. Using Polkadot's pre-signed transaction submission

This is technically complex but achievable. Should I proceed with implementing this approach, or would you prefer to explore other alternatives first?