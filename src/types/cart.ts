export interface CartItem {
  id: string;
  name: string;
  name_en: string;
  price: number;
  quantity: number;
  image: string;
  category_id: string;
  spice_level: number;
  is_popular: boolean;
  ingredients: string[];
  allergens: string[];
  note?: string; // Optional note for special instructions
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  serviceCharge: number;
  vat: number;
  grandTotal: number;
}

export interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}
