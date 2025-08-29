# Replicate AI Integration Setup

This project uses Replicate's API with Google's nano-banana model for generating NFT avatar images. Replicate offers better billing control and transparent pricing compared to direct API access.

## Prerequisites

The required packages are already installed:
- `replicate` - Replicate API SDK
- `mime` - MIME type utilities

## Configuration

1. **Get your Replicate API Token**
   - Visit [Replicate API Tokens](https://replicate.com/account/api-tokens)
   - Sign in with your account (GitHub/Google)
   - Create a new API token
   - Copy the API token

2. **Set Environment Variable**
   Create a `.env.local` file in your project root and add:
   ```
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

3. **Restart your development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## How It Works

1. **User uploads a base image** (optional for reference)
2. **User selects avatar traits** (headgear, clothing, accessories, etc.)
3. **System builds a descriptive prompt** from the selected traits
4. **Replicate's nano-banana model generates** a unique avatar image based on the prompt
5. **Generated image is displayed** in the preview pane
6. **User can lock and mint** the avatar as an NFT

## API Endpoints

- `POST /api/generate-avatar` - Generate avatar images using Replicate nano-banana model
- `GET /api/generate-avatar` - Health check and configuration status

## Features

- **Real-time generation**: Images are generated using Google's nano-banana model via Replicate
- **Trait-based prompts**: Enhanced prompts built from user-selected traits optimized for the nano-banana model
- **Error handling**: Graceful error handling with user-friendly messages
- **Transparent billing**: Replicate's pay-per-use pricing model with clear cost tracking
- **High-quality output**: Professional-grade images suitable for NFT collections
- **Base64 data URLs**: Images are converted to data URLs for immediate display

## Troubleshooting

### "REPLICATE_API_TOKEN environment variable is not configured"
- Make sure you've created a `.env.local` file with the correct API token
- Restart your development server after adding the environment variable

### "Failed to generate image"
- Check your internet connection
- Verify your API token is valid and has sufficient credits
- Check the browser console for detailed error messages
- Ensure you have access to the nano-banana model on Replicate

### Debug Information
The service includes detailed logging to help troubleshoot issues:
- Check the server console for generation logs
- Look for "Replicate output type" and "Extracted image URL" messages
- The service handles both string URLs and URL objects from Replicate
- Images are automatically converted to data URLs for immediate display

### Rate limiting
- Replicate handles rate limiting automatically
- Multiple requests can be made in parallel for better performance
- Check your account limits on the Replicate dashboard

## Cost Considerations

- **Transparent pricing**: Replicate shows exact costs per generation
- **Pay-per-use**: Only pay for successful image generations
- **Better control**: Set spending limits and monitor usage in real-time
- **Model-specific pricing**: nano-banana model pricing is clearly displayed on [Replicate](https://replicate.com/google/nano-banana/api)
- **No surprise bills**: Replicate's billing is more predictable than direct API access

## Model Information

Using Google's nano-banana model via Replicate:
- **Model**: `google/nano-banana:f1c6a56baa893b2b0b73e7c95ac7a0fd8afcebc4577a75d8f88b4d0ba3e25b76`
- **Description**: Google's latest image editing model in Gemini 2.5
- **Capabilities**: High-quality image generation with excellent prompt following
- **Performance**: Fast generation times with professional results

## Next Steps

- The generated avatars can be locked and prepared for NFT minting
- Integration with Polkadot blockchain for actual NFT creation is planned for Phase 2
