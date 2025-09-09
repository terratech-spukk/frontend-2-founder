'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem, CartContextType } from '@/types/cart';
import {
  getCartFromStorage,
  saveCartToStorage,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart as clearCartUtil,
  getItemQuantity,
} from '@/lib/cart-utils';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => getCartFromStorage());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => addItemToCart(prevCart, item));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => removeItemFromCart(prevCart, itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prevCart => updateItemQuantity(prevCart, itemId, quantity));
  };

  const clearCart = () => {
    setCart(clearCartUtil());
  };

  const getItemQuantityInCart = (itemId: string) => {
    return getItemQuantity(cart, itemId);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity: getItemQuantityInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
