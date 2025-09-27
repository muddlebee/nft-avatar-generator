'use server';

import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { paseo, polkadot } from "@polkadot-api/descriptors";
import { Binary } from "polkadot-api";

export async function getAccountBalance(address: string, network: 'polkadot' | 'paseo' = 'paseo') {
  try {
    const provider = getWsProvider(
      network === "polkadot" 
        ? "wss://rpc.ibp.network/polkadot"
        : "wss://rpc.ibp.network/paseo"
    );
    
    const client = createClient(provider);
    const descriptor = network === "polkadot" ? polkadot : paseo;
    const typedApi = client.getTypedApi(descriptor);

    const accountInfo = await typedApi.query.System.Account.getValue(address);
    const freeBalance = accountInfo?.data.free || 0n;
    
    return {
      success: true,
      balance: freeBalance.toString(),
      network
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function estimateTransactionFee(address: string, network: 'polkadot' | 'paseo' = 'paseo') {
  try {
    const provider = getWsProvider(
      network === "polkadot" 
        ? "wss://rpc.ibp.network/polkadot"
        : "wss://rpc.ibp.network/paseo"
    );
    
    const client = createClient(provider);
    const descriptor = network === "polkadot" ? polkadot : paseo;
    const typedApi = client.getTypedApi(descriptor);

    // Create a simple remark transaction for fee estimation
    const remarkBytes = new TextEncoder().encode("Fee estimation");
    const tx = typedApi.tx.System.remark({ remark: Binary.fromBytes(remarkBytes) });
    
    const paymentInfo = await tx.getEstimatedFees(address);
    
    return {
      success: true,
      fee: paymentInfo.toString(),
      network
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
