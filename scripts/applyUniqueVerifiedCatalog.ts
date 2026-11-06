import fs from 'fs';
import path from 'path';

// Clean helper to extract signature
function extractSig(urlOrId: string): string {
  const m = urlOrId.match(/photo-([a-zA-Z0-9-]+)/);
  return m ? m[1] : urlOrId;
}

export function applyUniqueCatalog() {
  const dbPath = path.resolve('data/shopkart.db.json');
  const catalogPath = path.resolve('server/catalog/products.json');
  const poolPath = path.resolve('scripts/verified_live_pool.json');

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const verifiedPool: string[] = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

  const products = dbData.products;
  console.log(`Starting unique catalog assignment for ${products.length} products...`);
  console.log(`Available verified live photos in pool: ${verifiedPool.length}`);

  const usedSignatures = new Set<string>();
  const productToImageMap = new Map<string, string>();

  // First pass: keep current product image IF it is already unique and valid
  for (const p of products) {
    if (p.images && p.images[0]) {
      const sig = extractSig(p.images[0]);
      if (!usedSignatures.has(sig) && verifiedPool.some(v => extractSig(v) === sig)) {
        usedSignatures.add(sig);
        productToImageMap.set(p.id, p.images[0]);
      }
    }
  }

  console.log(`Preserved ${usedSignatures.size} already unique & verified product images.`);

  // Second pass: assign fresh verified images from the verified pool to products that had duplicates or unverified images
  let poolIndex = 0;
  for (const p of products) {
    if (!productToImageMap.has(p.id)) {
      let chosenId: string | null = null;
      while (poolIndex < verifiedPool.length) {
        const candidate = verifiedPool[poolIndex++];
        const candidateSig = extractSig(candidate);
        if (!usedSignatures.has(candidateSig)) {
          usedSignatures.add(candidateSig);
          chosenId = candidate;
          break;
        }
      }

      if (!chosenId) {
        throw new Error(`Exhausted verified live photo pool at product ${p.id} (${p.title})!`);
      }

      const cleanId = chosenId.startsWith('photo-') ? chosenId : `photo-${chosenId}`;
      const primaryUrl = `https://images.unsplash.com/${cleanId}?w=800&auto=format&fit=crop&q=80`;
      productToImageMap.set(p.id, primaryUrl);
    }
  }

  // Update products with primary and gallery images
  for (const p of products) {
    const primaryUrl = productToImageMap.get(p.id)!;
    p.images = [
      primaryUrl,
      primaryUrl.replace('w=800', 'w=1200'),
      primaryUrl.replace('fit=crop', 'fit=inside'),
    ];
  }

  console.log(`Successfully updated all ${products.length} products!`);
  console.log(`Total unique primary image signatures: ${usedSignatures.size} / ${products.length}`);

  if (usedSignatures.size !== products.length) {
    throw new Error(`Integrity assertion failed: expected ${products.length} unique signatures, got ${usedSignatures.size}`);
  }

  // Save to persistent database and catalog
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  if (fs.existsSync(catalogPath)) {
    fs.writeFileSync(catalogPath, JSON.stringify(dbData.products, null, 2), 'utf8');
  }

  console.log('Database and server catalog updated successfully.');
  return { total: products.length, unique: usedSignatures.size };
}

applyUniqueCatalog();
