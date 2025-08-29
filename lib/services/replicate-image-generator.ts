import Replicate from 'replicate';

export interface ReplicateImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  predictionId?: string;
}

// Interface for nano-banana model output
interface NanoBananaOutput {
  url(): string | URL;
  [key: string]: any;
}

export class ReplicateImageGenerator {
  private replicate: Replicate;

  constructor(apiToken: string) {
    this.replicate = new Replicate({
      auth: apiToken,
    });
  }

  async generateAvatarImage(prompt: string, imageInput?: string | string[]): Promise<ReplicateImageGenerationResult> {
    try {
      // Prepare input object for nano-banana model
      const inputData: any = {
        prompt: prompt,
      };

      // Add image input if provided
      if (imageInput) {
        if (Array.isArray(imageInput)) {
          inputData.image_input = imageInput;
        } else {
          inputData.image_input = [imageInput];
        }
      }

      // Using Google's nano-banana model via Replicate
      const output = await this.replicate.run(
        "google/nano-banana",
        {
          input: inputData
        }
      );

      // The output is an object with a url() method for nano-banana model
      if (output && typeof output === 'object' && 'url' in output) {
        const nanoBananaOutput = output as NanoBananaOutput;
        const imageUrlObject = nanoBananaOutput.url();
                
        // Convert URL object to string
        let imageUrlString: string;
        if (imageUrlObject instanceof URL) {
          imageUrlString = imageUrlObject.href;
        } else if (typeof imageUrlObject === 'string') {
          imageUrlString = imageUrlObject;
        } else {
          console.error('Unexpected URL format:', typeof imageUrlObject, imageUrlObject);
          return {
            success: false,
            error: 'Invalid URL format received from Replicate',
          };
        }
        
        console.log('Image URL string:', imageUrlString);
        
        if (imageUrlString && imageUrlString.startsWith('http')) {
          // Convert remote URL to data URL for consistent handling
          const dataUrl = await this.convertUrlToDataUrl(imageUrlString);
          
          return {
            success: true,
            imageUrl: dataUrl,
          };
        }
      }

      return {
        success: false,
        error: 'No valid image URL received from Replicate API',
      };

    } catch (error) {
      console.error('Replicate image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateMultipleVariants(prompt: string, count: number = 1, imageInput?: string | string[]): Promise<ReplicateImageGenerationResult[]> {
    const results: ReplicateImageGenerationResult[] = [];
    
    // Generate multiple images in parallel for better performance
    const promises = Array.from({ length: count }, () => 
      this.generateAvatarImage(prompt, imageInput)
    );
    
    const generatedResults = await Promise.allSettled(promises);
    
    for (const result of generatedResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          error: result.reason?.message || 'Generation failed',
        });
      }
    }
    
    return results;
  }

  private async convertUrlToDataUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = blob.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      return dataUrl;
    } catch (error) {
      console.error('Failed to convert URL to data URL:', error);
      // Return the original URL as fallback
      return imageUrl;
    }
  }

  // Method to check API status and configuration
  async checkApiStatus(): Promise<{ isConfigured: boolean; error?: string }> {
    try {
      // Try to get account information to verify the API token
      const account = await this.replicate.accounts.current();
      return {
        isConfigured: true,
      };
    } catch (error) {
      return {
        isConfigured: false,
        error: error instanceof Error ? error.message : 'API token verification failed',
      };
    }
  }
}
