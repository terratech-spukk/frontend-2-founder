import { Cart, CartItem } from "@/types/cart";

const CART_STORAGE_KEY = "hotel_cart";

// Calculate cart totals
export const calculateCartTotals = (items: CartItem[]): Omit<Cart, "items"> => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Calculate VAT that's already included in the food prices
  // If food price is 100 THB, the actual food cost is 100/1.07 ≈ 93.46 THB
  // and VAT is 100 - 93.46 ≈ 6.54 THB
  const foodCostBeforeVat = Math.round(subtotal / 1.07);
  const vatIncluded = subtotal - foodCostBeforeVat;

  const grandTotal = subtotal; // No service charge, just food price
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalItems,
    subtotal: foodCostBeforeVat, // Show the actual food cost before VAT
    serviceCharge: 0, // No service charge
    vat: vatIncluded, // Show VAT included in food prices
    grandTotal,
  };
};

// Get cart from localStorage
export const getCartFromStorage = (): Cart => {
  if (typeof window === "undefined") {
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      serviceCharge: 0,
      vat: 0,
      grandTotal: 0,
    };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const totals = calculateCartTotals(parsed.items || []);
      return {
        items: parsed.items || [],
        ...totals,
      };
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }

  return {
    items: [],
    totalItems: 0,
    subtotal: 0,
    serviceCharge: 0,
    vat: 0,
    grandTotal: 0,
  };
};

// Save cart to localStorage
export const saveCartToStorage = (cart: Cart): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Create unique ID for cart item based on item ID and note
const createCartItemId = (itemId: string, note?: string): string => {
  return note ? `${itemId}_${note}` : itemId;
};

// Add item to cart
export const addItemToCart = (
  cart: Cart,
  newItem: Omit<CartItem, "quantity">,
): Cart => {
  const cartItemId = createCartItemId(newItem.id, newItem.note);
  const existingItemIndex = cart.items.findIndex(
    (item) => item.id === newItem.id && item.note === newItem.note,
  );

  let updatedItems: CartItem[];

  if (existingItemIndex >= 0) {
    // Item with same ID and note exists, increment quantity
    updatedItems = cart.items.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  } else {
    // New item or same item with different note, add to cart
    updatedItems = [...cart.items, { ...newItem, quantity: 1 }];
  }

  const totals = calculateCartTotals(updatedItems);

  return {
    items: updatedItems,
    ...totals,
  };
};

// Remove item from cart (by cart item ID which includes note)
export const removeItemFromCart = (cart: Cart, cartItemId: string): Cart => {
  const updatedItems = cart.items.filter((item) => {
    const itemCartId = createCartItemId(item.id, item.note);
    return itemCartId !== cartItemId;
  });
  const totals = calculateCartTotals(updatedItems);

  return {
    items: updatedItems,
    ...totals,
  };
};

// Update item quantity in cart (by cart item ID which includes note)
export const updateItemQuantity = (
  cart: Cart,
  cartItemId: string,
  quantity: number,
): Cart => {
  if (quantity <= 0) {
    return removeItemFromCart(cart, cartItemId);
  }

  const updatedItems = cart.items.map((item) => {
    const itemCartId = createCartItemId(item.id, item.note);
    return itemCartId === cartItemId ? { ...item, quantity } : item;
  });

  const totals = calculateCartTotals(updatedItems);

  return {
    items: updatedItems,
    ...totals,
  };
};

// Clear cart
export const clearCart = (): Cart => {
  return {
    items: [],
    totalItems: 0,
    subtotal: 0,
    serviceCharge: 0,
    vat: 0,
    grandTotal: 0,
  };
};

// Get item quantity in cart (by item ID only - sums all quantities for same item regardless of note)
export const getItemQuantity = (cart: Cart, itemId: string): number => {
  const items = cart.items.filter((item) => item.id === itemId);
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

// Format currency for display
export const formatTHB = (amount: number): string => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
