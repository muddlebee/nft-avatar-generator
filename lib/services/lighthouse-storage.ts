import lighthouse from '@lighthouse-web3/sdk';
import { createHash } from 'crypto';
import type { NFTMetadata, TraitSelection } from '@/components/avatar-generator/types';

export class LighthouseStorage {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Test API key and connectivity (browser-compatible)
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a simple test file using browser File API
      const testContent = JSON.stringify({
        message: "IPFS connection test (browser)",
        timestamp: new Date().toISOString()
      });
      
      const testBlob = new Blob([testContent], { type: 'application/json' });
      const testFile = new File([testBlob], 'test.json', { type: 'application/json' });
      
      // Upload to Lighthouse (browser method)
      const response = await lighthouse.upload([testFile], this.apiKey);
      
      if (response.data?.Hash) {
        return { success: true };
      } else {
        return { success: false, error: 'No hash returned from upload' };
      }
    } catch (error) {
      console.error('IPFS connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Upload image to IPFS via Lighthouse with progress callback (browser-compatible)
   */
  async uploadImage(
    imageUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<{ cid: string; gatewayUrl: string }> {
    try {
      onProgress?.(10);
      
      // Download image from URL (Replicate result)
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      
      onProgress?.(30);
      
      const arrayBuffer = await response.arrayBuffer();
      
      onProgress?.(50);
      
      // Create File object from arrayBuffer (browser-compatible)
      const imageFile = new File([arrayBuffer], 'avatar.png', { type: 'image/png' });
      
      onProgress?.(70);
      
      // Upload to Lighthouse using browser File API
      const uploadResponse = await lighthouse.upload([imageFile], this.apiKey);
      
      if (!uploadResponse.data?.Hash) {
        throw new Error('No hash returned from image upload');
      }

      onProgress?.(100);
      
      const cid = uploadResponse.data.Hash;
      const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
      
      return { cid, gatewayUrl };
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create and upload NFT metadata to IPFS with progress callback (browser-compatible)
   */
  async uploadMetadata(
    imageCID: string,
    traits: TraitSelection,
    seed: number,
    prompt: string,
    itemId: number,
    onProgress?: (progress: number) => void
  ): Promise<{ cid: string; metadata: NFTMetadata; gatewayUrl: string }> {
    try {
      onProgress?.(10);
      
      // Create metadata following OpenSea standard
      const metadata: NFTMetadata = {
        name: `FlameVerse Avatar #${itemId}`,
        description: "AI-generated avatar NFT from FlameVerse collection on Paseo testnet",
        image: `ipfs://${imageCID}`,
        attributes: this.buildAttributes(traits),
        properties: {
          model: "google/nano-banana",
          seed,
          prompt_sha256: createHash('sha256').update(prompt).digest('hex'),
          generator: "flamverse-avatar-generator@1.0.0",
          created_at: new Date().toISOString(),
        }
      };

      onProgress?.(40);

      // Create File object from metadata JSON (browser-compatible)
      const metadataJson = JSON.stringify(metadata, null, 2);
      const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

      onProgress?.(70);

      // Upload to Lighthouse using browser File API
      const uploadResponse = await lighthouse.upload([metadataFile], this.apiKey);
      
      if (!uploadResponse.data?.Hash) {
        throw new Error('No hash returned from metadata upload');
      }

      onProgress?.(100);
      
      const cid = uploadResponse.data.Hash;
      const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
      
      return { cid, metadata, gatewayUrl };
    } catch (error) {
      console.error('Metadata upload error:', error);
      throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete upload flow: image + metadata (for testing)
   */
  async uploadComplete(
    imageUrl: string,
    traits: TraitSelection,
    seed: number,
    prompt: string,
    itemId: number,
    onProgress?: (step: string, progress: number) => void
  ): Promise<{
    imageCID: string;
    metadataCID: string;
    metadata: NFTMetadata;
    imageGatewayUrl: string;
    metadataGatewayUrl: string;
  }> {
    // Upload image first
    onProgress?.('Uploading image to IPFS...', 0);
    const imageResult = await this.uploadImage(imageUrl, (progress) => {
      onProgress?.('Uploading image to IPFS...', progress * 0.5); // 0-50%
    });

    // Upload metadata
    onProgress?.('Uploading metadata to IPFS...', 50);
    const metadataResult = await this.uploadMetadata(
      imageResult.cid,
      traits,
      seed,
      prompt,
      itemId,
      (progress) => {
        onProgress?.('Uploading metadata to IPFS...', 50 + (progress * 0.5)); // 50-100%
      }
    );

    return {
      imageCID: imageResult.cid,
      metadataCID: metadataResult.cid,
      metadata: metadataResult.metadata,
      imageGatewayUrl: imageResult.gatewayUrl,
      metadataGatewayUrl: metadataResult.gatewayUrl,
    };
  }

  /**
   * Convert traits to OpenSea-compatible attributes
   */
  private buildAttributes(traits: TraitSelection): Array<{ trait_type: string; value: string }> {
    const attributes: Array<{ trait_type: string; value: string }> = [];
    
    Object.entries(traits).forEach(([key, value]) => {
      if (value) {
        attributes.push({
          trait_type: this.formatTraitType(key),
          value: value
        });
      }
    });

    return attributes;
  }

  private formatTraitType(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
}

export interface IPFSTestResult {
  success: boolean;
  imageCID?: string;
  metadataCID?: string;
  imageGatewayUrl?: string;
  metadataGatewayUrl?: string;
  error?: string;
  timing?: {
    imageUpload: number;
    metadataUpload: number;
    total: number;
  };
}
