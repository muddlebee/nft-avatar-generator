NFT Avatar Generator

**Upload base pic → pick traits → generate variations with FLUX-Kontext-Pro → (optional) mint.**

---

# 1) User Flow (MVP)

1. **Upload**

   * Accept JPG/PNG (≤ 5 MB). Show preview.
   * (Optional) Let user draw a quick **mask** (eyes/forehead/hat area) if you plan local edits.

2. **Trait Selector**

   * Categories: **Headgear, Face Accessory, Clothing, Background, Expression**.
   * Each is a simple radio/toggle. Also expose a **Randomize** button.

3. **Generate Variations**

   * Build prompt from base + selected traits.
   * Call **FLUX-Kontext-Pro**.
   * Return 1 image with the selected traits.

4. **Lock + Save**

   * User clicks one variant 
   * (Optional) **Mint** later—separate button.

---

# 2) Minimal Prompt Template

Keep it short + slot the traits:

```
cartoon avatar of a flame-headed character with big round black eyes, wearing a hoodie, {headgear}, {clothing}, {accessory}, {background}, {expression}
```

Examples the app will compose:

* `..., black beanie, leather jacket, round glasses, neon city background, smirk`
* `..., no headgear, wizard robe, golden halo, galaxy background, determined`

**Negative prompt (safe default):**

```
blurry, overexposed, low quality, watermark, text, signature
```

---

# 3) Model Call (Kontext-Pro)

Use **image-to-image**; if you captured a mask, switch to **inpaint**.

**Params (good starting point):**

* `prompt`: (from template above)
* `negative_prompt`: as above
* `image`: user upload (base)
* `mask`: (optional; transparent PNG where white = editable)
* `strength`: `0.3–0.45`  *(lower = preserves base)*
* `cfg_scale/guidance`: `4.0–6.0`
* `steps`: `20–28`
* `seed`: generate N seeds (e.g., 4..9) to produce a grid

---

# 4) Data Shapes

**Traits (config JSON):**

```json
{
  "headgear": ["none", "beanie", "samurai helmet", "crown"],
  "accessory": ["none", "round glasses", "visor", "halo"],
  "clothing": ["hoodie", "leather jacket", "wizard robe", "armor"],
  "background": ["plain gradient", "neon city", "forest", "galaxy"],
  "expression": ["neutral", "smirk", "determined", "happy"]
}
```

**Generation request:**

```json
{
  "imageUrl": "/uploads/tmp/abc.png",
  "traits": {
    "headgear": "beanie",
    "accessory": "round glasses",
    "clothing": "leather jacket",
    "background": "neon city",
    "expression": "smirk"
  },
  "maskUrl": null,
  "seeds": [41,42,43,44]
}
```

**Generation response:**

```json
{
  "variants": [
    {"seed": 41, "url": "/renders/41.png"},
    {"seed": 42, "url": "/renders/42.png"},
    {"seed": 43, "url": "/renders/43.png"},
    {"seed": 44, "url": "/renders/44.png"}
  ],
  "params": {
    "strength": 0.35,
    "guidance": 5.0,
    "steps": 24,
    "negative": "blurry, overexposed, low quality, watermark, text, signature"
  }
}
```

---

# 5) Minimal API (Next.js)

**POST `/api/upload`**

* Accept multipart, virus/size check, store to `/uploads/tmp/…`.
* Return `{ imageUrl }`.

**POST `/api/generate`**

* Body: `imageUrl`, `traits`, `maskUrl?`, `seeds[]`.
* Compose prompt → call Kontext-Pro N times (or batched) → return variant URLs.

**POST `/api/lock`**

* Body: chosen `seed`, final image URL.
* Persist `prompt`, `seed`, `params`, and the **SHA-256** of image+JSON.

*(You can add `/api/mint` later to push metadata to Lighthouse/NFT.Storage + set `ipfs://CID` on Asset Hub.)*

---

# 6) Frontend Components

* `<UploadCard>`: drag-drop + preview + (optional) mask painter.
* `<TraitSidebar>`: categories → radio/toggle; Randomize button.
* `<PreviewPane>`: large live preview (last render) + **VariantGrid** (thumbnails).
* `<ActionBar>`: **Generate** (disabled until traits picked), **Lock**, **Mint** (optional).
* State: `baseImage`, `mask`, `selectedTraits`, `variants[]`, `locked`.

---

# 7) Edge Cases & Defaults

* If user selects **“none”** for headgear/accessory, omit that slot from the prompt (or insert “no headgear”).
* Debounce generate (300–500ms) after trait changes to avoid spam.
* Fallback seed if not provided.
* If the base image is very different (e.g., not a head), show a tip: “Use lower strength for subtle edits.”

---