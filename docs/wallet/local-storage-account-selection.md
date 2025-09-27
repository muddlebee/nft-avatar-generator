How wallet account selection flows through the system now that we've simplified it.

## **Account Selection Flow**

### **1. User Interaction in Wallet Modal**
```typescript
// In wallet-connector-modal.tsx (line 428)
onSelect={() => setSelectedAccount(account)}
```

When a user clicks on an account card, it calls `setSelectedAccount(account)` with the full account object.

### **2. Hook Handles Storage Automatically**
```typescript
// In use-selected-account.ts (lines 67-78)
const setSelectedAccount = useCallback((account: KheopskitAccount | null) => {
  const id = account?.id || null;
  setSelectedId(id);
  
  if (typeof window !== 'undefined') {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);  // ← Storage happens here
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}, []);
```

The hook automatically:
1. **Extracts the account ID** from the account object
2. **Updates React state** (`setSelectedId`)
3. **Saves to localStorage** (`kheopskit:selected-account-id`)

### **3. State Restoration on Page Load**
```typescript
// In use-selected-account.ts (lines 29-37)
useEffect(() => {
  if (typeof window !== 'undefined' && !isInitialized) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSelectedId(stored);  // ← Restore from storage
    }
    setIsInitialized(true);
  }
}, [isInitialized]);
```

When the app loads:
1. **Reads from localStorage** (`kheopskit:selected-account-id`)
2. **Sets the selected ID** in React state
3. **Marks as initialized**

### **4. Account Object Resolution**
```typescript
// In use-selected-account.ts (lines 40-43)
const selectedAccount = useMemo(() => 
  selectedId ? accounts.find(acc => acc.id === selectedId) || null : null,
  [selectedId, accounts]
);
```

The hook automatically finds the full account object by matching the stored ID with the current accounts list.

## **Key Benefits of This Approach**

### **✅ Automatic Persistence**
- No manual localStorage calls needed in components
- Selection persists across page refreshes automatically

### **✅ Validation & Cleanup**
```typescript
// Lines 55-64: Validates stored account still exists
useEffect(() => {
  if (selectedId && accounts.length > 0 && isInitialized) {
    const exists = accounts.some(acc => acc.id === selectedId);
    if (!exists) {
      console.warn('Stored account no longer exists, clearing selection');
      setSelectedId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}, [selectedId, accounts, isInitialized]);
```

If a stored account ID no longer exists (wallet disconnected), it automatically clears the selection.

### **✅ Auto-Selection**
```typescript
// Lines 46-52: Auto-selects single accounts
useEffect(() => {
  if (isInitialized && accounts.length === 1 && !selectedId) {
    const account = accounts[0];
    setSelectedId(account.id);
    localStorage.setItem(STORAGE_KEY, account.id);
  }
}, [accounts, selectedId, isInitialized]);
```

If only one account is available, it automatically selects it.

## **Complete Flow Example**

1. **User clicks account** → `setSelectedAccount(account)` called
2. **Hook extracts ID** → `account.id` → `"polkadot-account-123"`
3. **Updates state** → `setSelectedId("polkadot-account-123")`
4. **Saves to storage** → `localStorage.setItem('kheopskit:selected-account-id', 'polkadot-account-123')`
5. **Page refresh** → Hook reads storage → Restores `selectedId` → Finds account object
6. **Components re-render** → `selectedAccount` is available everywhere

## **Why This is Better Than Direct localStorage**

### **Before (Direct localStorage):**
```typescript
// Components had to manually handle storage
const handleSelectAccount = (account) => {
  localStorage.setItem('selected-account', account.id);
  setSelectedAccount(account);
};

// Had to manually restore on mount
useEffect(() => {
  const stored = localStorage.getItem('selected-account');
  if (stored) {
    const account = accounts.find(acc => acc.id === stored);
    setSelectedAccount(account);
  }
}, []);
```

### **After (Hook handles everything):**
```typescript
// Components just call the hook function
const { selectedAccount, setSelectedAccount } = useSelectedAccount();

// Storage, validation, restoration all automatic!
```

The hook abstracts away all the localStorage complexity, validation, and state management, making it much simpler for components to use while providing robust functionality under the hood.