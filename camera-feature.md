Add Google Vision photo lookup to JapanFlip
Goal: Add a camera/photo button to the SearchCard that lets the user take or upload a photo, sends it to Google Cloud Vision, and uses the returned labels to auto-fill the item name and category fields before running the lookup.
Files to touch:

app/app/page.tsx (or wherever SearchCard lives) — add the photo button UI
app/api/vision/route.ts — new API route (create this)
lib/visionMap.ts — new file mapping Vision labels → JapanFlip categories (create this)

New API route POST /api/vision:

Accepts { imageBase64: string, mimeType: string }
Calls Google Cloud Vision annotateImage with LABEL_DETECTION and WEB_DETECTION features (web detection gives brand/product names, much better for specific items like watches)
Returns { labels: string[], webEntities: string[] } — raw strings only, no processing here
Key: GOOGLE_VISION_API_KEY from env
Max 5 labels, max 5 web entities to keep response small

New file lib/visionMap.ts:

A function mapLabelsToCategory(labels: string[]): { category: string, itemName: string } | null
Maps Vision label strings to JapanFlip's 7 categories: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Other
Examples: ["watch", "seiko", "wristwatch"] → { category: "Watches", itemName: "Seiko watch" }, ["denim", "jeans", "levi"] → { category: "Clothing", itemName: "Levi's denim" }
Should combine webEntities (brand name) + labels (item type) to form a reasonable itemName string
Returns null if nothing matches

SearchCard UI changes:

Add a small camera icon button next to the item name input (not replacing it)
Clicking opens a file input with accept="image/*" capture="environment" — this triggers the native camera on mobile, file picker on desktop
On image select: show a spinner on the button, send to /api/vision, call mapLabelsToCategory, pre-fill item name + category fields, then auto-submit the search
If Vision returns nothing useful (null from mapLabelsToCategory): show a brief inline error "Couldn't identify item — please type it" and leave fields empty
Button states: idle (camera icon) → loading (spinner) → done (auto-submits) or error (message)
Image is converted to base64 client-side before sending — do not store or display the image anywhere

Env var needed:

Add GOOGLE_VISION_API_KEY to .env.local and document it in .env.example

Constraints:

No new npm packages — use native fetch for the Vision API call, native FileReader for base64 conversion
Keep the Vision call server-side (API route) so the key is never exposed to the client
This should not change any existing lookup logic — Vision just pre-fills the same fields the user would have typed