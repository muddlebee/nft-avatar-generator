import { GoogleGenAI } from '@google/genai';
import mime from 'mime';

export interface ImageGenerationResult {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

export class GeminiImageGenerator {
    private ai: GoogleGenAI;
    private model = 'gemini-2.5-flash-image-preview';

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({
            apiKey,
        });
    }

    async generateAvatarImage(prompt: string): Promise<ImageGenerationResult> {
        try {
            const config = {
                responseModalities: ['IMAGE' as const, 'TEXT' as const],
            };

            const contents = [
                {
                    role: 'user' as const,
                    parts: [
                        {
                            //  text: `Generate a high-quality NFT avatar image: ${prompt}. The image should be clean, professional, and suitable for use as a digital collectible avatar. Style should be modern and artistic with vibrant colors.`,
                            text: `${prompt}`
                        },
                    ],
                },
            ];

            const response = await this.ai.models.generateContentStream({
                model: this.model,
                config,
                contents,
            });

            // Process the stream to get the generated image
            for await (const chunk of response) {
                if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
                    continue;
                }

                // Check for inline image data
                if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
                    const inlineData = chunk.candidates[0].content.parts[0].inlineData;
                    const buffer = Buffer.from(inlineData.data || '', 'base64');

                    // Convert buffer to data URL for immediate use in the UI
                    const mimeType = inlineData.mimeType || 'image/jpeg';
                    const base64Data = buffer.toString('base64');
                    const dataUrl = `data:${mimeType};base64,${base64Data}`;

                    return {
                        success: true,
                        imageUrl: dataUrl,
                    };
                }
            }

            return {
                success: false,
                error: 'No image data received from Gemini API',
            };

        } catch (error) {
            console.error('Gemini image generation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    async generateMultipleVariants(prompt: string, count: number = 1): Promise<ImageGenerationResult[]> {
        // For cost efficiency, we'll generate one at a time
        // In production, you might want to batch or use different strategies
        const results: ImageGenerationResult[] = [];

        for (let i = 0; i < count; i++) {
            const result = await this.generateAvatarImage(prompt);
            results.push(result);

            // Add small delay between requests to avoid rate limiting
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }
}
