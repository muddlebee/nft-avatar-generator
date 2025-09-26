"use client";

import { useCallback } from 'react';
import { createClient, Binary, TypedApi } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { MultiAddress, paseo_asset_hub } from "@polkadot-api/descriptors";
import { useWallets } from "@kheopskit/react";
import type { TraitSelection } from '@/components/avatar-generator/types';
import { LighthouseStorage } from '@/lib/services/lighthouse-storage';
import { buildPrompt } from '@/lib/avatar-generator/prompt-builder';
import { useSelectedPolkadotAccount } from '@/providers/kheopskit-selected-account-provider';

// Type definitions for polkadot-api
type PolkadotApiClient = ReturnType<typeof createClient>;
type PaseoAssetHubApi = TypedApi<typeof paseo_asset_hub>;

// Transaction event types based on polkadot-api patterns
interface TransactionEvent {
  type: string;
  txHash?: string;
  block?: {
    hash: string;
    number: number;
  };
  found?: boolean;
  error?: string;
  ok?: boolean;
  dispatchError?: {
    type: string;
    value?: any;
  };
}

// Specific event types
interface BroadcastedEvent extends TransactionEvent {
  type: 'broadcasted';
  txHash: string;
}

interface TxBestBlocksStateEvent extends TransactionEvent {
  type: 'txBestBlocksState';
  found: boolean;
  txHash: string;
}

interface FinalizedEvent extends TransactionEvent {
  type: 'finalized';
  txHash: string;
  block: {
    hash: string;
    number: number;
  };
  ok: boolean;
  dispatchError?: {
    type: string;
    value?: any;
  };
}

interface ErrorEvent extends TransactionEvent {
  type: 'error';
  error: string;
}

type TxEvent = BroadcastedEvent | TxBestBlocksStateEvent | FinalizedEvent | ErrorEvent;

// Subscription types
interface TxSubscription {
  subscribe(observer: {
    next: (event: TxEvent) => void;
    error: (error: any) => void;
  }): {
    unsubscribe: () => void;
  };
}

// Progress tracking interface
export interface MintingProgress {
  step: 'idle' | 'uploading-image' | 'uploading-metadata' | 'getting-item-id' | 'creating-transaction' | 'signing' | 'broadcasting' | 'in-block' | 'finalized' | 'error';
  message: string;
  progress: number; // 0-100
  txHash?: string;
  blockHash?: string;
  itemId?: number;
  error?: string;
  ipfsData?: {
    imageCID: string;
    metadataCID: string;
    imageGatewayUrl: string;
    metadataGatewayUrl: string;
  };
}

// Minting result interface
export interface MintingResult {
  success: boolean;
  itemId?: number;
  txHash?: string;
  blockHash?: string;
  error?: string;
  ipfsData?: {
    imageCID: string;
    metadataCID: string;
    imageGatewayUrl: string;
    metadataGatewayUrl: string;
  };
}

export function useNFTMinting() {
  const { accounts } = useWallets();
  const selectedPolkadotAccount = useSelectedPolkadotAccount();

  // Configuration from environment
  const COLLECTION_ID = parseInt(process.env.NEXT_PUBLIC_NFT_COLLECTION_ID || '0');
  const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
  const RPC_ENDPOINT = "wss://sys.ibp.network/asset-hub-paseo"; // Paseo asset hub testnet

  /**
   * Get next available item ID from chain
   */
  const getNextItemId = async (typedApi: PaseoAssetHubApi): Promise<number> => {
    // Since NextItemId doesn't exist in Paseo Asset Hub, we'll use timestamp-based IDs
    // For production, you might want to query existing items and increment
    // For now, we'll use timestamp-based IDs which are unique enough for testing
    return Math.floor(Date.now() / 1000); // Unix timestamp as item ID
  };

  /**
   * Create batch transaction for mint + setMetadata
   */
  // const createMintTransaction = (
  //   typedApi: PaseoAssetHubApi,
  //   itemId: number,
  //   ownerAddress: string,
  //   metadataCID: string
  // ) => {
  //   // Create individual transactions
  //   const mintTx = typedApi.tx.Nfts.mint({
  //     collection: COLLECTION_ID,
  //     item: itemId,
  //     mint_to: MultiAddress.Id(ownerAddress),
  //     witness_data: undefined, // Optional witness data
  //   });

  //   const metadataTx = typedApi.tx.Nfts.set_metadata({
  //     collection: COLLECTION_ID,
  //     item: itemId,
  //     data: Binary.fromText(`ipfs://${metadataCID}`),
  //   });

  //   // Create batch transaction with proper call structure
  //   return typedApi.tx.Utility.batch_all({
  //     calls: [mintTx.decodedCall, metadataTx.decodedCall]
  //   });
  // };

  /**
   * Complete minting flow: IPFS upload + NFT mint with progress tracking
   */
  const mintNFT = useCallback(async (
    avatarImageUrl: string,
    traits: TraitSelection,
    seed: number,
    onProgressUpdate: (progress: MintingProgress) => void
  ): Promise<MintingResult> => {
    // Validation checks
    if (!LIGHTHOUSE_API_KEY) {
      throw new Error('LIGHTHOUSE_API_KEY not configured');
    }

    if (COLLECTION_ID === 0) {
      throw new Error('NFT_COLLECTION_ID not configured');
    }

    if (!selectedPolkadotAccount) {
      throw new Error('No Polkadot account selected. Please select an account in the wallet modal.');
    }

    let client: PolkadotApiClient | null = null;

    try {
      // Step 1: Upload image to IPFS (0-30%)
      onProgressUpdate({
        step: 'uploading-image',
        message: 'Uploading avatar image to IPFS...',
        progress: 5
      });

      const lighthouse = new LighthouseStorage(LIGHTHOUSE_API_KEY);
      const imageResult = await lighthouse.uploadImage(avatarImageUrl, (progress) => {
        onProgressUpdate({
          step: 'uploading-image',
          message: 'Uploading avatar image to IPFS...',
          progress: 5 + (progress * 0.25) // 5-30%
        });
      });

      // Step 2: Create PAPI client and get item ID (30-40%)
      onProgressUpdate({
        step: 'uploading-metadata',
        message: 'Preparing NFT metadata...',
        progress: 30
      });

      const provider = getWsProvider(RPC_ENDPOINT);
      client = createClient(provider);
      const typedApi = client.getTypedApi(paseo_asset_hub);

      onProgressUpdate({
        step: 'getting-item-id',
        message: 'Getting next available NFT item ID...',
        progress: 35
      });

      const itemId = await getNextItemId(typedApi);

      // Step 3: Upload metadata to IPFS (40-60%)
      const prompt = buildPrompt(traits);
      const metadataResult = await lighthouse.uploadMetadata(
        imageResult.cid,
        traits,
        seed,
        prompt,
        itemId,
        (progress) => {
          onProgressUpdate({
            step: 'uploading-metadata',
            message: 'Uploading NFT metadata to IPFS...',
            progress: 40 + (progress * 0.2) // 40-60%
          });
        }
      );

      const ipfsData = {
        imageCID: imageResult.cid,
        metadataCID: metadataResult.cid,
        imageGatewayUrl: imageResult.gatewayUrl,
        metadataGatewayUrl: metadataResult.gatewayUrl,
      };

      // Step 4: Create NFT transaction (60-70%)
      onProgressUpdate({
        step: 'creating-transaction',
        message: 'Creating NFT mint transaction...',
        progress: 60,
        itemId,
        ipfsData
      });

      // const batchTx = createMintTransaction(
      //   typedApi,
      //   itemId,
      //   polkadotAccount.address,
      //   metadataResult.cid
      // );

      const mintTx = typedApi.tx.Nfts.mint({
        collection: COLLECTION_ID,
        item: itemId,
        mint_to: MultiAddress.Id(selectedPolkadotAccount.address),
        witness_data: undefined, // Optional witness data
      });


      // Step 5: Sign and submit transaction (70-80%)
      onProgressUpdate({
        step: 'signing',
        message: 'Please sign the transaction in your wallet...',
        progress: 70,
        itemId,
        ipfsData
      });

      const txResult = await mintTx.signSubmitAndWatch(selectedPolkadotAccount.polkadotSigner);

      onProgressUpdate({
        step: 'broadcasting',
        message: 'Transaction submitted, waiting for inclusion...',
        progress: 80,
        itemId,
        ipfsData
      });

      // Step 6: Watch transaction progress (80-100%)
      return new Promise((resolve, reject) => {
        const subscription = txResult.subscribe({
          next: (event: any) => { // Temporarily use any to debug the event structure
            console.log('Transaction event:', event);

            // Check if event exists and has type property
            if (!event || typeof event.type !== 'string') {
              console.warn('Invalid event structure:', event);
              return;
            }

            switch (event.type) {
              case 'broadcasted':
                onProgressUpdate({
                  step: 'broadcasting',
                  message: 'Transaction broadcasted to network...',
                  progress: 85,
                  txHash: event.txHash,
                  itemId,
                  ipfsData
                });
                break;

              case 'txBestBlocksState':
                if (event.found) {
                  onProgressUpdate({
                    step: 'in-block',
                    message: 'Transaction included in block...',
                    progress: 90,
                    txHash: event.txHash,
                    itemId,
                    ipfsData
                  });
                }
                break;

              case 'finalized':
                onProgressUpdate({
                  step: 'finalized',
                  message: `NFT minted successfully! Item ID: ${itemId}`,
                  progress: 100,
                  txHash: event.txHash,
                  blockHash: event.block?.hash,
                  itemId,
                  ipfsData
                });

                subscription.unsubscribe();
                if (client) client.destroy();

                resolve({
                  success: true,
                  itemId,
                  txHash: event.txHash,
                  blockHash: event.block?.hash,
                  ipfsData
                });
                break;

              case 'error':
                onProgressUpdate({
                  step: 'error',
                  message: `Transaction failed: ${event.error}`,
                  progress: 0,
                  error: event.error,
                  itemId,
                  ipfsData
                });

                subscription.unsubscribe();
                if (client) client.destroy();

                reject(new Error(event.error));
                break;
            }
          },
          error: (error: Error & { type?: string; value?: any; message: string }) => {
            console.error('Transaction subscription error:', error);
            onProgressUpdate({
              step: 'error',
              message: `Transaction error: ${error.message}`,
              progress: 0,
              error: error.message,
              itemId,
              ipfsData
            });

            if (client) client.destroy();
            reject(error);
          }
        });

        // Timeout after 10 minutes
        setTimeout(() => {
          subscription.unsubscribe();
          if (client) client.destroy();
          reject(new Error('Transaction timeout after 10 minutes'));
        }, 10 * 60 * 1000);
      });

    } catch (error) {
      console.error('NFT minting error:', error);

      if (client) {
        client.destroy();
      }

      onProgressUpdate({
        step: 'error',
        message: `Minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }, [accounts, COLLECTION_ID, LIGHTHOUSE_API_KEY, RPC_ENDPOINT]);

  /**
   * Check if minting is properly configured
   */
  const isConfigured = () => {
    return !!(LIGHTHOUSE_API_KEY && COLLECTION_ID > 0);
  };

  /**
   * Get current configuration status
   */
  const getConfigStatus = () => {
    return {
      hasLighthouseKey: !!LIGHTHOUSE_API_KEY,
      hasCollectionId: COLLECTION_ID > 0,
      collectionId: COLLECTION_ID,
      hasPolkadotAccount: accounts.some(acc => acc.platform === 'polkadot'),
      hasSelectedPolkadotAccount: !!selectedPolkadotAccount,
      selectedAccountAddress: selectedPolkadotAccount?.address,
      rpcEndpoint: RPC_ENDPOINT
    };
  };

  return {
    mintNFT,
    isConfigured: isConfigured(),
    configStatus: getConfigStatus(),
    collectionId: COLLECTION_ID,
    rpcEndpoint: RPC_ENDPOINT
  };
}
