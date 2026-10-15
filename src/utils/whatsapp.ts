import { Product } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  notes?: string;
}

export const WHATSAPP_PHONE_RAW = '0702782946';
export const WHATSAPP_PHONE_INTERNATIONAL = '254702782946';
export const WHATSAPP_PHONE_FORMATTED = '+254 702 782946';

/**
 * Builds a formatted WhatsApp message for multiple items in the cart
 */
export function buildCartWhatsAppUrl(
  items: CartItem[],
  customerDetails?: {
    name?: string;
    location?: string;
    additionalNotes?: string;
  }
): string {
  if (items.length === 0) {
    const defaultMsg = 'Hello Nelson, I am browsing your FishWithNelson fishing gear catalogue and have an inquiry regarding your available fishing equipment.';
    return `https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(defaultMsg)}`;
  }

  let text = `*ORDER INQUIRY — FISHWITHNELSON*\n`;
  text += `---------------------------------\n`;
  if (customerDetails?.name?.trim()) {
    text += `*Customer:* ${customerDetails.name.trim()}\n`;
  }
  if (customerDetails?.location?.trim()) {
    text += `*Delivery Destination:* ${customerDetails.location.trim()}\n`;
  }
  text += `\n*Selected Fishing Equipment:*\n`;

  items.forEach((item, index) => {
    const num = index + 1;
    text += `${num}. *${item.quantity}x* ${item.product.name}\n`;
    text += `   - Category: ${item.product.category} (${item.product.subcategory})\n`;
    if (item.selectedVariant) {
      text += `   - Variant / Spec: ${item.selectedVariant}\n`;
    }
    if (item.notes?.trim()) {
      text += `   - Note: ${item.notes.trim()}\n`;
    }
  });

  text += `\n---------------------------------\n`;
  if (customerDetails?.additionalNotes?.trim()) {
    text += `*Additional Request:* ${customerDetails.additionalNotes.trim()}\n\n`;
  }

  text += `Hello Nelson, please confirm availability for these items, provide current prices, and advise on payment instructions and delivery arrangement.\n\nThank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a direct WhatsApp inquiry URL for a single product
 */
export function buildSingleProductWhatsAppUrl(
  product: Product,
  variant?: string
): string {
  let text = `*PRODUCT INQUIRY — FISHWITHNELSON*\n\n`;
  text += `Hello Nelson, I would like to inquire about this equipment from your catalogue:\n\n`;
  text += `*Product:* ${product.name}\n`;
  text += `*Brand:* ${product.brand}\n`;
  text += `*Category:* ${product.category}\n`;
  if (product.subcategory) {
    text += `*Type:* ${product.subcategory}\n`;
  }
  if (variant) {
    text += `*Specification:* ${variant}\n`;
  }
  text += `\nPlease confirm current availability, price, and delivery arrangement to my location.\n\nThank you!`;

  return `https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(text)}`;
}
