import { NextRequest, NextResponse } from 'next/server';
import { LighthouseStorage } from '@/lib/services/lighthouse-storage';
import { buildPrompt } from '@/lib/avatar-generator/prompt-builder';
import type { TraitSelection } from '@/components/avatar-generator/types';

export async function POST(request: NextRequest) {
  try {
    const { action, imageUrl, traits, seed } = await request.json();

    // Validate environment
    const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'NEXT_PUBLIC_LIGHTHOUSE_API_KEY environment variable is not configured' 
        },
        { status: 500 }
      );
    }

    const lighthouse = new LighthouseStorage(apiKey);

    // Test connection
    if (action === 'test-connection') {
      const result = await lighthouse.testConnection();
      return NextResponse.json({
        success: result.success,
        message: result.success ? 'IPFS connection successful!' : result.error,
        apiKeyConfigured: true,
        timestamp: new Date().toISOString()
      });
    }

    // Test image upload
    if (action === 'test-image-upload') {
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'imageUrl is required for image upload test' },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      const result = await lighthouse.uploadImage(imageUrl);
      const uploadTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: {
          imageCID: result.cid,
          gatewayUrl: result.gatewayUrl,
          uploadTime: `${uploadTime}ms`
        }
      });
    }

    // Test metadata upload
    if (action === 'test-metadata-upload') {
      if (!imageUrl || !traits || seed === undefined) {
        return NextResponse.json(
          { success: false, error: 'imageUrl, traits, and seed are required for metadata test' },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      
      // First upload image
      const imageResult = await lighthouse.uploadImage(imageUrl);
      const imageTime = Date.now() - startTime;
      
      // Then upload metadata
      const metadataStartTime = Date.now();
      const prompt = buildPrompt(traits as TraitSelection);
      const itemId = 12345; // Test item ID
      
      const metadataResult = await lighthouse.uploadMetadata(
        imageResult.cid,
        traits as TraitSelection,
        seed,
        prompt,
        itemId
      );
      const metadataTime = Date.now() - metadataStartTime;
      const totalTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: {
          imageCID: imageResult.cid,
          metadataCID: metadataResult.cid,
          imageGatewayUrl: imageResult.gatewayUrl,
          metadataGatewayUrl: metadataResult.gatewayUrl,
          metadata: metadataResult.metadata,
          timing: {
            imageUpload: `${imageTime}ms`,
            metadataUpload: `${metadataTime}ms`,
            total: `${totalTime}ms`
          }
        }
      });
    }

    // Test complete flow
    if (action === 'test-complete-flow') {
      if (!imageUrl || !traits || seed === undefined) {
        return NextResponse.json(
          { success: false, error: 'imageUrl, traits, and seed are required for complete flow test' },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      const prompt = buildPrompt(traits as TraitSelection);
      const itemId = Date.now(); // Use timestamp as test item ID
      
      const result = await lighthouse.uploadComplete(
        imageUrl,
        traits as TraitSelection,
        seed,
        prompt,
        itemId
      );
      
      const totalTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          timing: {
            total: `${totalTime}ms`
          }
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: test-connection, test-image-upload, test-metadata-upload, or test-complete-flow' },
      { status: 400 }
    );

  } catch (error) {
    console.error('IPFS test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
  
  return NextResponse.json({
    status: 'IPFS Test API is running (Browser-Compatible)',
    configured: hasApiKey,
    environment: 'server-side',
    lighthouse: 'browser File API compatible',
    availableActions: [
      'test-connection',
      'test-image-upload', 
      'test-metadata-upload',
      'test-complete-flow'
    ],
    timestamp: new Date().toISOString(),
  });
}
