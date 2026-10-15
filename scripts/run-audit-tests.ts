/**
 * Automated Verification & QA Test Suite for FishWithNelson
 * Tests cart operations, WhatsApp enquiry generation, product catalogue search,
 * and routing constraints.
 */

import { buildCartWhatsAppUrl, buildSingleProductWhatsAppUrl, CartItem } from '../src/utils/whatsapp';
import { PRODUCTS } from '../src/data/products';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../src/utils/adminConstants';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

console.log('\n=== FISHWITHNELSON AUTOMATED AUDIT & TEST SUITE ===\n');

// 1. WhatsApp Destination and Phone Formatting Tests
console.log('1. WhatsApp Destination & Enquiry Generation');
const sampleProduct = PRODUCTS[0];
const singleUrl = buildSingleProductWhatsAppUrl(sampleProduct);

assert(
  singleUrl.includes('wa.me/254702782946'),
  'Single product WhatsApp URL uses international number 254702782946'
);
assert(
  !singleUrl.toLowerCase().includes('ksh') && !singleUrl.toLowerCase().includes('kes') && !singleUrl.includes('price:'),
  'Single product WhatsApp enquiry does not expose or invent product prices'
);
assert(
  singleUrl.includes(encodeURIComponent(sampleProduct.name)),
  'Single product WhatsApp enquiry accurately includes product name'
);
assert(
  singleUrl.includes(encodeURIComponent('?product=' + sampleProduct.id)) ||
    singleUrl.includes(encodeURIComponent('product=' + sampleProduct.id)),
  'Single product WhatsApp enquiry is accompanied by product reference link'
);
assert(
  singleUrl.includes(encodeURIComponent('FISHING WITH NELSON')),
  'Single product WhatsApp enquiry branding is Fishing With Nelson'
);
assert(
  singleUrl.includes('availability') && singleUrl.includes('delivery'),
  'Single product WhatsApp enquiry requests seller availability and delivery confirmation'
);

// Multi-item cart WhatsApp URL
const mockCartItems: CartItem[] = [
  { product: PRODUCTS[0], quantity: 2, selectedVariant: 'Heavy Action' },
  { product: PRODUCTS[1], quantity: 1 },
];
const cartUrl = buildCartWhatsAppUrl(mockCartItems, {
  name: 'John Fisher',
  location: 'Naivasha Marina',
  additionalNotes: 'Need delivery by Saturday morning',
});

assert(
  cartUrl.includes('wa.me/254702782946'),
  'Cart WhatsApp URL uses wa.me/254702782946'
);
assert(
  cartUrl.includes(encodeURIComponent('?product=' + PRODUCTS[0].id)) &&
    cartUrl.includes(encodeURIComponent('?product=' + PRODUCTS[1].id)),
  'Cart WhatsApp order accompanies each item with its specific product link'
);
assert(
  cartUrl.includes('John%20Fisher'),
  'Cart WhatsApp URL includes customer name'
);
assert(
  cartUrl.includes('Naivasha%20Marina'),
  'Cart WhatsApp URL includes customer delivery destination'
);
assert(
  cartUrl.includes('2x') && cartUrl.includes(encodeURIComponent(PRODUCTS[0].name)),
  'Cart WhatsApp URL includes first item with correct quantity'
);
assert(
  cartUrl.includes('1x') && cartUrl.includes(encodeURIComponent(PRODUCTS[1].name)),
  'Cart WhatsApp URL includes second item with correct quantity'
);
assert(
  cartUrl.includes('confirm%20availability') && cartUrl.includes('payment%20instructions'),
  'Cart WhatsApp message specifies enquiry requires Nelson to confirm availability and payment'
);

// 2. Admin Credentials & Authorization Logic
console.log('\n2. Administrator Credentials & Configuration');
assert(
  ADMIN_USERNAME === 'FishingWithNelson',
  'Admin username matches specified FishingWithNelson'
);
assert(
  ADMIN_PASSWORD === '0987654321NelsonFishing',
  'Admin password matches specified 0987654321NelsonFishing'
);

// 3. Product Catalogue Integrity & Zero Price Exposure
console.log('\n3. Product Catalogue & Business Constraints');
assert(
  PRODUCTS.length > 0,
  `Product catalogue contains seed items (found ${PRODUCTS.length})`
);

let pricesFound = false;
PRODUCTS.forEach((p: any) => {
  if (p.price !== undefined || p.cost !== undefined) {
    pricesFound = true;
  }
});
assert(
  !pricesFound,
  'No public product items contain hardcoded or fabricated prices'
);

const missingNames = PRODUCTS.filter((p) => !p.name || !p.name.trim());
assert(
  missingNames.length === 0,
  'All catalogue products have valid, non-empty names'
);

const missingCategories = PRODUCTS.filter((p) => !p.category || !p.category.trim());
assert(
  missingCategories.length === 0,
  'All catalogue products have valid categories'
);

// 4. Cart Persistence & Bounds Testing
console.log('\n4. Cart Mathematics & Boundary Tests');
const emptyCartUrl = buildCartWhatsAppUrl([]);
assert(
  emptyCartUrl.includes('wa.me/254702782946'),
  'Empty cart falls back gracefully to general inquiry link'
);

console.log(`\n=== SUMMARY: ${passed} Passed, ${failed} Failed ===\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
