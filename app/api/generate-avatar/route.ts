import { NextRequest, NextResponse } from 'next/server';
import { ReplicateImageGenerator } from '@/lib/services/replicate-image-generator';
import { buildPrompt } from '@/lib/avatar-generator/prompt-builder';
import type { TraitSelection } from '@/components/avatar-generator/types';

export async function POST(request: NextRequest) {
  try {
    const { traits, baseImage } = await request.json();

    // Validate required environment variable
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'REPLICATE_API_TOKEN environment variable is not configured' 
        },
        { status: 500 }
      );
    }

    // Validate request body
    if (!traits) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing traits in request body' 
        },
        { status: 400 }
      );
    }

    // Build the prompt from traits with enhanced prompting for nano-banana model
    const basePrompt = buildPrompt(traits as TraitSelection);
    let enhancedPrompt: string;
    
    // if (baseImage) {
    //   // If base image is provided, use it for style reference
    //   enhancedPrompt = `Transform the uploaded image into: ${basePrompt}. Style: modern digital art, vibrant colors, clean lines, professional quality suitable for NFT collection. High resolution, detailed, artistic. Maintain the essence while applying the specified traits.`;
    // } else {
    //   // If no base image, generate from scratch
    //   enhancedPrompt = `Create a high-quality digital avatar NFT: ${basePrompt}. Style: modern digital art, vibrant colors, clean lines, professional quality suitable for NFT collection. High resolution, detailed, artistic.`;
    // }
    
    console.log('Generating avatar with Replicate nano-banana model:', basePrompt);
    console.log('Base image provided:', !!baseImage);

    // Initialize Replicate service and generate image
    const replicateGenerator = new ReplicateImageGenerator(apiToken);
    
    // Pass base image as image input if available
    const imageInput = baseImage ? [baseImage] : undefined;
    const result = await replicateGenerator.generateAvatarImage(basePrompt, imageInput);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to generate image with Replicate' 
        },
        { status: 500 }
      );
    }

    // Return the generated image data
    return NextResponse.json({
      success: true,
      variant: {
        id: `replicate-${Date.now()}`,
        seed: Math.floor(Math.random() * 10000),
        url: result.imageUrl,
        traits: traits,
        prompt: basePrompt,
        predictionId: result.predictionId,
      }
    });

  } catch (error) {
    console.error('Avatar generation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint for health checks
export async function GET() {
  const hasApiToken = !!process.env.REPLICATE_API_TOKEN;
  
  return NextResponse.json({
    status: 'Avatar generation API is running (Replicate nano-banana)',
    configured: hasApiToken,
    model: 'google/nano-banana',
    timestamp: new Date().toISOString(),
  });
}
