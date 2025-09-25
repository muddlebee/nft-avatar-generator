#!/usr/bin/env tsx

/**
 * IPFS Testing Script
 * Tests Lighthouse IPFS integration step by step
 * 
 * Usage: npx tsx scripts/test-ipfs.ts
 */

import { config } from 'dotenv';
import { LighthouseStorage } from '../lib/services/lighthouse-storage';

// Load environment variables from .env.local
config({ path: '.env.local' });
import { buildPrompt } from '../lib/avatar-generator/prompt-builder';
import type { TraitSelection } from '../components/avatar-generator/types';

// Test configuration
const TEST_CONFIG = {
  // Sample image URL (you can replace with any publicly accessible image)
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  
  // Sample traits for testing
  traits: {
    headgear: 'Beanie',
    accessory: 'Sunglasses',
    clothing: 'Hoodie',
    background: 'Neon City',
    expression: 'Smirk',
    hair: 'Long',
    skin: 'Light',
    special: 'Glowing Eyes',
    weapon: null
  } as TraitSelection,
  
  seed: 12345,
  itemId: 999
};

class IPFSTester {
  private lighthouse: LighthouseStorage;
  
  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_LIGHTHOUSE_API_KEY environment variable is required');
    }
    
    this.lighthouse = new LighthouseStorage(apiKey);
    console.log('🔧 IPFS Tester initialized with API key');
  }

  async runAllTests() {
    console.log('\n🚀 Starting IPFS Integration Tests...\n');
    
    try {
      // Test 1: Connection
      await this.testConnection();
      
      // Test 2: Image Upload
      const imageCID = await this.testImageUpload();
      
      // Test 3: Metadata Upload
      const metadataCID = await this.testMetadataUpload(imageCID);
      
      // Test 4: Complete Flow
      await this.testCompleteFlow();
      
      // Test 5: Gateway Access
      await this.testGatewayAccess(imageCID, metadataCID);
      
      console.log('\n✅ All IPFS tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    }
  }

  async testConnection() {
    console.log('📡 Test 1: Testing IPFS connection...');
    
    const result = await this.lighthouse.testConnection();
    
    if (result.success) {
      console.log('✅ Connection test passed');
    } else {
      throw new Error(`Connection test failed: ${result.error}`);
    }
  }

  async testImageUpload(): Promise<string> {
    console.log('\n🖼️  Test 2: Testing image upload...');
    console.log(`   Image URL: ${TEST_CONFIG.imageUrl}`);
    
    const startTime = Date.now();
    let lastProgress = 0;
    
    const result = await this.lighthouse.uploadImage(
      TEST_CONFIG.imageUrl,
      (progress) => {
        if (progress - lastProgress >= 25 || progress === 100) {
          console.log(`   Progress: ${progress}%`);
          lastProgress = progress;
        }
      }
    );
    
    const uploadTime = Date.now() - startTime;
    
    console.log(`✅ Image uploaded successfully in ${uploadTime}ms`);
    console.log(`   CID: ${result.cid}`);
    console.log(`   Gateway: ${result.gatewayUrl}`);
    
    return result.cid;
  }

  async testMetadataUpload(imageCID: string): Promise<string> {
    console.log('\n📋 Test 3: Testing metadata upload...');
    
    const prompt = buildPrompt(TEST_CONFIG.traits);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
    
    const startTime = Date.now();
    let lastProgress = 0;
    
    const result = await this.lighthouse.uploadMetadata(
      imageCID,
      TEST_CONFIG.traits,
      TEST_CONFIG.seed,
      prompt,
      TEST_CONFIG.itemId,
      (progress) => {
        if (progress - lastProgress >= 25 || progress === 100) {
          console.log(`   Progress: ${progress}%`);
          lastProgress = progress;
        }
      }
    );
    
    const uploadTime = Date.now() - startTime;
    
    console.log(`✅ Metadata uploaded successfully in ${uploadTime}ms`);
    console.log(`   CID: ${result.cid}`);
    console.log(`   Gateway: ${result.gatewayUrl}`);
    console.log(`   NFT Name: ${result.metadata.name}`);
    console.log(`   Attributes: ${result.metadata.attributes.length} traits`);
    
    return result.cid;
  }

  async testCompleteFlow() {
    console.log('\n🔄 Test 4: Testing complete upload flow...');
    
    const prompt = buildPrompt(TEST_CONFIG.traits);
    const itemId = Date.now(); // Use timestamp for unique ID
    
    const startTime = Date.now();
    
    const result = await this.lighthouse.uploadComplete(
      TEST_CONFIG.imageUrl,
      TEST_CONFIG.traits,
      TEST_CONFIG.seed,
      prompt,
      itemId,
      (step, progress) => {
        console.log(`   ${step} (${progress}%)`);
      }
    );
    
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Complete flow finished in ${totalTime}ms`);
    console.log(`   Image CID: ${result.imageCID}`);
    console.log(`   Metadata CID: ${result.metadataCID}`);
    console.log(`   NFT Item ID: ${itemId}`);
  }

  async testGatewayAccess(imageCID: string, metadataCID: string) {
    console.log('\n🌐 Test 5: Testing gateway accessibility...');
    
    // Test image gateway access
    try {
      const imageUrl = `https://gateway.lighthouse.storage/ipfs/${imageCID}`;
      console.log(`   Testing image access: ${imageUrl}`);
      
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
      if (imageResponse.ok) {
        console.log(`✅ Image accessible via gateway (${imageResponse.status})`);
      } else {
        console.log(`⚠️  Image gateway returned ${imageResponse.status}`);
      }
    } catch (error) {
      console.log(`⚠️  Image gateway test failed: ${error}`);
    }
    
    // Test metadata gateway access
    try {
      const metadataUrl = `https://gateway.lighthouse.storage/ipfs/${metadataCID}`;
      console.log(`   Testing metadata access: ${metadataUrl}`);
      
      const metadataResponse = await fetch(metadataUrl);
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json();
        console.log(`✅ Metadata accessible via gateway`);
        console.log(`   Retrieved NFT name: ${metadata.name}`);
        console.log(`   Retrieved attributes count: ${metadata.attributes?.length || 0}`);
      } else {
        console.log(`⚠️  Metadata gateway returned ${metadataResponse.status}`);
      }
    } catch (error) {
      console.log(`⚠️  Metadata gateway test failed: ${error}`);
    }
  }
}

// Helper function to display environment info
function displayEnvironmentInfo() {
  console.log('🔧 Environment Information:');
  console.log(`   LIGHTHOUSE_API_KEY: ${process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
}

// Main execution
async function main() {
  console.log('🧪 IPFS Integration Test Suite');
  console.log('================================');
  
  displayEnvironmentInfo();
  
  try {
    const tester = new IPFSTester();
    await tester.runAllTests();
    
    console.log('\n🎉 All tests passed! IPFS integration is ready.');
    console.log('\nNext steps:');
    console.log('1. Verify the gateway URLs work in your browser');
    console.log('2. Check that metadata structure matches OpenSea standards');
    console.log('3. Proceed with NFT minting integration');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:');
    console.error(error);
    
    console.log('\nTroubleshooting:');
    console.log('1. Verify NEXT_PUBLIC_LIGHTHOUSE_API_KEY is set correctly');
    console.log('2. Check your internet connection');
    console.log('3. Ensure Lighthouse API key has upload permissions');
    
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
