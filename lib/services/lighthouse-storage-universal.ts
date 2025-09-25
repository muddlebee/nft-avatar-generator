import lighthouse from '@lighthouse-web3/sdk';
import { createHash } from 'crypto';
import type { NFTMetadata, TraitSelection } from '@/components/avatar-generator/types';

// Check if we're in Node.js environment
const isNode = typeof window === 'undefined';

// Dynamic imports for Node.js-only modules
let fs: any, path: any;
if (isNode) {
  fs = require('fs');
  path = require('path');
}

export class LighthouseStorageUniversal {
  private apiKey: string;
  private tempDir?: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    // Only set up temp directory in Node.js environment
    if (isNode) {
      this.tempDir = path.join(process.cwd(), '.temp');
      
      try {
        fs.mkdirSync(this.tempDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }
    }
  }

  /**
   * Test API key and connectivity
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testContent = JSON.stringify({
        message: "IPFS connection test",
        timestamp: new Date().toISOString(),
        environment: isNode ? 'server' : 'browser'
      });

      if (isNode) {
        // Server-side: Use file system
        const testFilePath = path.join(this.tempDir!, `test-${Date.now()}.json`);
        fs.writeFileSync(testFilePath, testContent);
        
        const response = await lighthouse.upload(testFilePath, this.apiKey);
        
        try {
          fs.unlinkSync(testFilePath);
        } catch (cleanupError) {
          console.warn('Failed to clean up test file:', cleanupError);
        }
        
        return response.data?.Hash ? { success: true } : { success: false, error: 'No hash returned' };
      } else {
        // Browser-side: Use File API
        const testBlob = new Blob([testContent], { type: 'application/json' });
        const testFile = new File([testBlob], 'test.json', { type: 'application/json' });
        
        const response = await lighthouse.upload([testFile], this.apiKey);
        return response.data?.Hash ? { success: true } : { success: false, error: 'No hash returned' };
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
   * Upload image to IPFS via Lighthouse with progress callback
   */
  async uploadImage(
    imageUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<{ cid: string; gatewayUrl: string }> {
    try {
      onProgress?.(10);
      
      // Download image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      
      onProgress?.(30);
      
      const arrayBuffer = await response.arrayBuffer();
      
      onProgress?.(50);
      
      let uploadResponse;
      
      if (isNode) {
        // Server-side: Write to file system then upload
        const buffer = Buffer.from(arrayBuffer);
        const imageFilePath = path.join(this.tempDir!, `image-${Date.now()}.png`);
        
        fs.writeFileSync(imageFilePath, buffer);
        onProgress?.(70);
        
        uploadResponse = await lighthouse.upload(imageFilePath, this.apiKey);
        
        // Clean up temp file
        try {
          fs.unlinkSync(imageFilePath);
        } catch (cleanupError) {
          console.warn('Failed to clean up image file:', cleanupError);
        }
      } else {
        // Browser-side: Use File API directly
        const buffer = new Uint8Array(arrayBuffer);
        const imageFile = new File([buffer], 'avatar.png', { type: 'image/png' });
        
        onProgress?.(70);
        uploadResponse = await lighthouse.upload([imageFile], this.apiKey);
      }
      
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
   * Create and upload NFT metadata to IPFS with progress callback
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

      const metadataJson = JSON.stringify(metadata, null, 2);
      let uploadResponse;
      
      if (isNode) {
        // Server-side: Write to file system then upload
        const metadataFilePath = path.join(this.tempDir!, `metadata-${Date.now()}.json`);
        fs.writeFileSync(metadataFilePath, metadataJson);
        
        onProgress?.(70);
        uploadResponse = await lighthouse.upload(metadataFilePath, this.apiKey);
        
        // Clean up temp file
        try {
          fs.unlinkSync(metadataFilePath);
        } catch (cleanupError) {
          console.warn('Failed to clean up metadata file:', cleanupError);
        }
      } else {
        // Browser-side: Use File API directly
        const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
        
        onProgress?.(70);
        uploadResponse = await lighthouse.upload([metadataFile], this.apiKey);
      }
      
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
   * Complete upload flow: image + metadata (works in both environments)
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

  /**
   * Get environment info
   */
  getEnvironmentInfo() {
    return {
      environment: isNode ? 'server' : 'browser',
      supportsFileSystem: isNode,
      lighthouse: '✅ Available'
    };
  }
}

export interface IPFSTestResult {
  success: boolean;
  imageCID?: string;
  metadataCID?: string;
  imageGatewayUrl?: string;
  metadataGatewayUrl?: string;
  error?: string;
  environment?: string;
  timing?: {
    imageUpload: number;
    metadataUpload: number;
    total: number;
  };
}
