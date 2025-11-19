# AI Avatar Generator 🎨

An AI-powered avatar generator that creates unique, customizable digital avatars using cutting-edge artificial intelligence. Built for the **Google AI Hackathon**, this application leverages Google's nano-banana model via Replicate to transform trait selections into one-of-a-kind avatar variations.


## ✨ Features

### AI-Powered Avatar Generation
- **Google nano-banana Model**: Leverages Google's advanced AI model via Replicate API for high-quality image generation
- **Smart Trait System**: 6 customizable categories (headgear, accessories, clothing, expression, weapons, special effects) with 48 total options
- **Real-time Preview**: Instant visual feedback with generated avatar variants

### User Experience
- **Rate Limiting System**: Tier-based referral codes for fair API usage management
- **Responsive Design**: Beautiful UI that works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Full theme support with persistent preferences

### Modern Tech Stack
- **[Next.js 15.x](https://nextjs.org/docs/app/getting-started)** - Server-rendered pages with optimized client components
- **[Replicate API](https://replicate.com/)** - Production-grade AI model infrastructure with Google's nano-banana
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern, accessible React component library
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first styling framework
- **[TypeScript](https://www.typescriptlang.org/)** - End-to-end type safety
- **[Next Themes](https://ui.shadcn.com/docs/dark-mode/next)** - Seamless light/dark mode management

## 📁 Project Structure

```
nft-avatar-generator/
├── app/
│   ├── api/
│   │   └── generate-avatar/    # AI image generation API endpoint
│   ├── page.tsx                # Main avatar generator page
│   └── layout.tsx              # Root layout with providers
├── components/
│   ├── avatar-generator/       # Core avatar generation components
│   │   ├── avatar-generator-client.tsx  # Main client component
│   │   ├── upload-card.tsx              # Image upload & referral codes
│   │   ├── trait-sidebar.tsx            # Trait selection interface
│   │   └── preview-pane.tsx             # Avatar preview & actions
│   ├── ui/                     # Reusable UI components (shadcn)
│   └── layout/                 # Navigation, footer, theme toggle
├── lib/
│   ├── avatar-generator/       # Avatar generation logic
│   │   ├── prompt-builder.ts   # AI prompt construction
│   │   └── traits-config.ts    # Trait definitions & randomization
│   └── services/
│       └── replicate-image-generator.ts  # Replicate API integration
├── hooks/                      # Custom React hooks
└── providers/                  # Context providers (theme, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- A [Replicate API token](https://replicate.com/account/api-tokens)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/muddlebee/nft-avatar-generator.git
   cd nft-avatar-generator
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory:

   ```env
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

   Get your Replicate API token from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

5. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the avatar generator in action!

### Using Referral Codes

To generate avatars, you'll need a referral code. Try these demo codes:

- `X7K9M2P` - 2 attempts (Tier 2)
- `R4N8Q1L` - 3 attempts (Tier 3)

You can also pass them via URL: `http://localhost:3000?refCode=X7K9M2P`

## 🎯 How It Works

1. **Upload Base Image** (Optional)
   - Upload your own image or use the default character
   - Supports JPG/PNG up to 5MB

2. **Select Traits**
   - Choose from 6 categories: headgear, accessories, clothing, expression, weapons, special effects
   - Or hit "Randomize" for instant inspiration

3. **Generate Avatar**
   - Click "Generate Avatar" to create your unique variation
   - AI processes your traits and produces a high-quality image in 10-30 seconds

4. **Save and Download**
   - Preview your generated avatar
   - Download for future use


## 🌟 Use Cases

- **Digital Identity**: Create unique avatars for social media profiles
- **Gaming**: Generate character portraits for RPG campaigns
- **NFT Collections**: Design distinctive digital collectibles
- **Creative Exploration**: Experiment with AI-generated art styles
- **Community Building**: Let users create personalized avatars for your platform

## 🔮 Future Roadmap

- [ ] Multi-variant generation for side-by-side comparison
- [ ] Advanced editing tools for post-generation tweaks
- [ ] Style transfer for applying artistic effects
- [ ] Community gallery for browsing and inspiration
- [ ] Animation support for dynamic avatars
- [ ] Export options (various formats and resolutions)
- [ ] Batch generation for collections
- [ ] Custom trait creation interface

## 🏆 Built for Google AI Hackathon

This project showcases the power of modern AI image generation, demonstrating how cutting-edge models like Google's nano-banana can be integrated into practical, user-friendly applications. By combining intelligent prompt engineering with thoughtful UX design, we've created a tool that makes AI-powered creativity accessible to everyone.

---

**Made with ❤️ using Google's AI technology**
