"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import dynamic from "next/dynamic";

// Account interface from Kheopskit
interface KheopskitAccount {
  id: string;
  address: string;
  name?: string;
  platform: "polkadot" | "ethereum";
  walletName: string;
  polkadotSigner?: any;
  client?: any;
}

interface KheopskitSelectedAccountContext {
  selectedAccount: KheopskitAccount | null;
  selectedAccountId: string | null;
  setSelectedAccount: (account: KheopskitAccount | null) => void;
  setSelectedAccountById: (accountId: string | null) => void;
  clearSelection: () => void;
  isLoading: boolean;
  isClientReady: boolean;
}

const KheopskitSelectedAccountContext = createContext<KheopskitSelectedAccountContext>({
  selectedAccount: null,
  selectedAccountId: null,
  setSelectedAccount: () => {},
  setSelectedAccountById: () => {},
  clearSelection: () => {},
  isLoading: true,
  isClientReady: false,
});

const SELECTED_ACCOUNT_KEY = "kheopskit:selected-account-id";

// Utility functions
const isClient = () => typeof window !== 'undefined';

const getStoredAccountId = (): string | null => {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(SELECTED_ACCOUNT_KEY);
  } catch {
    return null;
  }
};

const setStoredAccountId = (accountId: string | null): void => {
  if (!isClient()) return;
  try {
    if (accountId) {
      localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
    } else {
      localStorage.removeItem(SELECTED_ACCOUNT_KEY);
    }
  } catch (error) {
    console.warn('Failed to update localStorage:', error);
  }
};

// Main Provider Component
export function KheopskitSelectedAccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Hydration check - ensures client-side only rendering
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Return SSR-safe default state
  if (!isClientReady) {
    return (
      <KheopskitSelectedAccountContext.Provider
        value={{
          selectedAccount: null,
          selectedAccountId: null,
          setSelectedAccount: () => {},
          setSelectedAccountById: () => {},
          clearSelection: () => {},
          isLoading: true,
          isClientReady: false,
        }}
      >
        {children}
      </KheopskitSelectedAccountContext.Provider>
    );
  }

  // Render client-side provider with dynamic import
  return <DynamicClientSideProvider>{children}</DynamicClientSideProvider>;
}

// Dynamic import to prevent SSR issues with useWallets
const DynamicClientSideProvider = dynamic(
  () => import("@kheopskit/react").then((mod) => {
    const { useWallets } = mod;
    
    // Client-side only provider component
    function ClientSideProvider({ children }: { children: ReactNode }) {
      const { accounts } = useWallets();
      const [selectedAccountId, setSelectedAccountIdState] = useState<string | null>(null);
      const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (!hasInitialized) {
      const storedId = getStoredAccountId();
      if (storedId) {
        setSelectedAccountIdState(storedId);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Auto-select single account
  useEffect(() => {
    if (hasInitialized && accounts.length === 1 && !selectedAccountId) {
      const accountId = accounts[0].id;
      setSelectedAccountIdState(accountId);
      setStoredAccountId(accountId);
    }
  }, [accounts, selectedAccountId, hasInitialized]);

  // Validate stored account
  useEffect(() => {
    if (selectedAccountId && accounts.length > 0 && hasInitialized) {
      const accountExists = accounts.some(account => account.id === selectedAccountId);
      if (!accountExists) {
        console.warn('Stored account no longer exists, clearing selection');
        setSelectedAccountIdState(null);
        setStoredAccountId(null);
      }
    }
  }, [selectedAccountId, accounts, hasInitialized]);

  // Compute derived state
  const selectedAccount = selectedAccountId 
    ? accounts.find(account => account.id === selectedAccountId) || null
    : null;

  const isLoading = Boolean(!hasInitialized || 
    (selectedAccountId && !selectedAccount && accounts.length === 0));

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Account Provider Debug:', {
      selectedAccountId,
      selectedAccount: selectedAccount?.address,
      accountsCount: accounts.length,
      hasInitialized,
      isLoading
    });
  }

  // Action handlers
  const setSelectedAccount = (account: KheopskitAccount | null) => {
    const accountId = account?.id || null;
    setSelectedAccountIdState(accountId);
    setStoredAccountId(accountId);
  };

  const setSelectedAccountById = (accountId: string | null) => {
    setSelectedAccountIdState(accountId);
    setStoredAccountId(accountId);
  };

  const clearSelection = () => {
    setSelectedAccountIdState(null);
    setStoredAccountId(null);
  };

      return (
        <KheopskitSelectedAccountContext.Provider
          value={{
            selectedAccount,
            selectedAccountId,
            setSelectedAccount,
            setSelectedAccountById,
            clearSelection,
            isLoading,
            isClientReady: true,
          }}
        >
          {children}
        </KheopskitSelectedAccountContext.Provider>
      );
    }
    
    return ClientSideProvider;
  }),
  { ssr: false }
);

// Hooks
export const useKheopskitSelectedAccount = () => {
  const context = useContext(KheopskitSelectedAccountContext);
  if (!context) {
    throw new Error(
      "useKheopskitSelectedAccount must be used within a KheopskitSelectedAccountProvider",
    );
  }
  return context;
};

export const useSelectedAccount = () => {
  const { selectedAccount } = useKheopskitSelectedAccount();
  return selectedAccount;
};

export const useSelectedPolkadotAccount = () => {
  const { selectedAccount } = useKheopskitSelectedAccount();
  return selectedAccount?.platform === 'polkadot' ? selectedAccount : null;
};

// Additional utility hooks
export const useAccountSelection = () => {
  const { 
    selectedAccount, 
    setSelectedAccount, 
    clearSelection, 
    isLoading 
  } = useKheopskitSelectedAccount();
  
  return {
    selectedAccount,
    selectAccount: setSelectedAccount,
    clearAccount: clearSelection,
    isLoading,
    hasSelectedAccount: !!selectedAccount,
  };
};
