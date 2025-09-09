'use client';

import { useState } from 'react';
import { MenuItem } from '@/types/menu';
import { useCart } from '@/contexts/CartContext';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const AddToCartModal = ({ 
  isOpen, 
  onClose, 
  menuItem, 
  quantity, 
  onQuantityChange 
}: AddToCartModalProps) => {
  const { addToCart } = useCart();
  const [note, setNote] = useState('');

  if (!isOpen || !menuItem) return null;

  const handleAddToCart = () => {
    // Add the item to cart with the specified quantity and note
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: menuItem.id,
        name: menuItem.name,
        name_en: menuItem.name_en,
        price: menuItem.price,
        image: menuItem.image,
        category_id: menuItem.category_id,
        spice_level: menuItem.spice_level,
        is_popular: menuItem.is_popular,
        ingredients: menuItem.ingredients,
        allergens: menuItem.allergens,
        note: note.trim() || undefined, // Add note to cart item
      });
    }
    
    // Reset form and close modal
    setNote('');
    onClose();
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add to Cart</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Menu Item Info */}
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{menuItem.name}</h4>
              <p className="text-sm text-gray-500">{menuItem.name_en}</p>
              <p className="text-lg font-semibold text-orange-600">฿{menuItem.price}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity / จำนวน
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions / หมายเหตุพิเศษ
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., No spicy, Extra vegetables, No onions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {note.length}/200 characters
            </div>
          </div>

          {/* Allergens Warning */}
          {menuItem.allergens.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-red-800 mb-1">Allergen Information</h5>
              <p className="text-xs text-red-600">
                Contains: {menuItem.allergens.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Add to Cart - ฿{menuItem.price * quantity}
          </button>
        </div>
      </div>
    </div>
  );
};
