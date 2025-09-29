
## 🔹 Server Components

* **Best for all network calls** to your backend, RPCs, indexers, GraphQL APIs, or chain nodes.

  * Fetching balances, NFTs, histories, on-chain state → Server Component.
  * Heavy calls (archival queries, simulations, indexing) → Server Component.
* **Why**:

  * Keeps RPC keys/secrets safe (not leaked to browser).
  * Reduces client bundle size (no need to ship `@polkadot/api` or `ethers` to the browser).
  * Leverages caching, SSR, and data streaming in Next.js.
* **Rule**: If it’s “just data” → fetch in server, pass plain JSON/props to client.

---

## 🔹 Client Components

* **Best for interactivity and wallet signing.**

  * Buttons, forms, toggles, charts, modals.
  * Wallet signing via `polkadot-js extension`, `MetaMask`, or hardware wallet.
* **Why**:

  * Signing needs the user’s private key, which must stay in the browser/wallet.
  * Client components can use hooks (`useState`, `useEffect`) and browser APIs.
* **Rule**: If it needs user state, event handlers, or crypto keys → Client Component.

---

## ⚖️ Putting it together (flow)

1. **Server Component** fetches chain data (balances, pending txs) → renders UI → passes down props.
2. **Client Component** shows a “Sign & Send” button → triggers wallet signing.
3. The signed payload can either:

   * **(a) Go directly to the node** (client submits).
   * **(b) Be sent back to your server action/route** → server validates + relays.

---

## ✅ Benefits

* Small client JS bundle (you don’t ship `@polkadot/api` to the browser unless needed).
* Safer architecture (no RPC secrets in frontend).
* Cleaner separation of roles:

  * Server = data fetcher / validator.
  * Client = signer / interactor.

---
