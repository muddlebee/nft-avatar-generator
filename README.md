# NFT Avatar Generator

An AI-powered NFT avatar generator built on Polkadot. Generate custom avatars, mint them as NFTs on Paseo testnet, and store metadata on IPFS - all with a seamless one-click experience.

## Features

### NFT Minting & Storage
- **One-Click NFT Minting** - Complete IPFS upload and blockchain minting in a single action
- **IPFS Storage** - Decentralized storage via Lighthouse with browser-compatible uploads
- **Paseo Testnet Integration** - Built for Polkadot's Paseo testnet with real-time progress tracking

### Polkadot Integration
- **[Polkadot API (PAPI)](https://papi.how)** - Lightclient-based blockchain interactions with batch transactions
- **KheopsKit Wallet** - Seamless wallet connection and transaction signing
- **Real-time Progress** - Track IPFS uploads (0-60%) and minting (60-100%) with live feedback

### Modern Tech Stack
- **[Next.js 15.x](https://nextjs.org/docs/app/getting-started)** - Server-rendered pages with optimized client components
- **[shadcn ui](https://ui.shadcn.com/)** - Modern, accessible React components
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first styling
- **[Next Themes](https://ui.shadcn.com/docs/dark-mode/next)** - Light and dark mode support

## Project Structure

- `app/`: Main application files and API routes (avatar generation, IPFS testing)
- `components/avatar-generator/`: Avatar generation UI, trait selection, and minting interface
- `components/chain-ui/`: Blockchain transaction components
- `hooks/`: Custom hooks including `use-nft-minting.ts` for complete minting flow
- `lib/services/`: IPFS storage, AI image generation (Gemini/Replicate)
- `providers/`: KheopsKit wallet, Polkadot connection, and theme providers

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/muddlebee/nft-avatar-generator.git
   ```

2. Install dependencies:

   ```bash
   cd nft-avatar-generator
   pnpm install
   ```

3. Configure environment variables (`.env.local`):

   ```env
   NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
   NEXT_PUBLIC_NFT_COLLECTION_ID=your_collection_id
   REPLICATE_API_TOKEN=your_replicate_api_token
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```
   
5. Setup your Polkadot wallet and get some Polkadot testnet (Paseo) tokens from Asset Hub using [Testnet Faucet](https://faucet.polkadot.io/).


<img width="567" height="446" alt="image" src="https://github.com/user-attachments/assets/227c8e62-01b9-41eb-b26a-7f2479d543ac" />


## How It Works

1. **Generate Avatar** - Upload a base image and select custom traits
2. **Preview & Lock** - Review generated variants and lock your favorite
3. **Mint NFT** - One-click minting that handles IPFS upload and blockchain transaction
4. **Track Progress** - Real-time feedback from upload (0-60%) to finalization (100%)
5. **Success** - Receive your NFT item ID and transaction link on Subscan

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any
improvements or bug fixes.

## License

This project is open-source and available under the MIT License.
