'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { MenuItem } from '@/types/menu';
import { categories } from '@/data/food_categories';
import Image from 'next/image';

interface FoodMenu extends MenuItem {
  category_name?: string;
}

export default function FoodEditPage() {
  const [foodMenus, setFoodMenus] = useState<FoodMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FoodMenu | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFoodMenus();
  }, []);

  const fetchFoodMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<FoodMenu[]>('/food-menus/');
      const menus = response.data || [];
      
      // Map category names
      const menusWithCategoryNames = menus.map(menu => {
        const category = categories.find(cat => cat.id === menu.category_id);
        return {
          ...menu,
          category_name: category ? category.name : 'Unknown Category'
        };
      });
      
      setFoodMenus(menusWithCategoryNames);
    } catch (err) {
      console.error('Error fetching food menus:', err);
      setError('Failed to fetch food menus');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: FoodMenu) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleSave = async (updatedItem: FoodMenu) => {
    try {
      // Here you would typically make an API call to update the item
      await api.put(`/food-menus/${updatedItem.id}`, updatedItem);
      
      // For now, update the local state
      setFoodMenus(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      setIsEditing(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating food menu:', err);
      setError('Failed to update food menu');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading food menus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchFoodMenus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Food Menu Management</h1>
          <p className="mt-2 text-gray-600">Edit and manage food menu items</p>
        </div>

        {isEditing && editingItem ? (
          <FoodEditForm
            item={editingItem}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <FoodMenuList
            items={foodMenus}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}

interface FoodMenuListProps {
  items: FoodMenu[];
  onEdit: (item: FoodMenu) => void;
}

function FoodMenuList({ items, onEdit }: FoodMenuListProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Food Menu Items</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spice Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Popular
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.image && (
                      <Image
                        className="h-10 w-10 rounded-lg object-cover mr-4"
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.name_en}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.category_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ฿{item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < item.spice_level ? 'text-red-500' : 'text-gray-300'
                        }`}
                      >
                        🌶️
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.is_popular 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.is_popular ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface FoodEditFormProps {
  item: FoodMenu;
  onSave: (item: FoodMenu) => void;
  onCancel: () => void;
}

function FoodEditForm({ item, onSave, onCancel }: FoodEditFormProps) {
  const [formData, setFormData] = useState<FoodMenu>(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof FoodMenu, value: FoodMenu[keyof FoodMenu]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Edit Food Menu Item</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (English)
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) => handleChange('name_en', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.name_en})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spice Level
            </label>
            <select
              value={formData.spice_level}
              onChange={(e) => handleChange('spice_level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[0, 1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>
                  {level} - {level === 0 ? 'No spice' : '🌶️'.repeat(level)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_popular"
              checked={formData.is_popular}
              onChange={(e) => handleChange('is_popular', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-700">
              Popular Item
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients (comma-separated)
          </label>
          <input
            type="text"
            value={formData.ingredients.join(', ')}
            onChange={(e) => handleChange('ingredients', e.target.value.split(',').map(i => i.trim()))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergens (comma-separated)
          </label>
          <input
            type="text"
            value={formData.allergens.join(', ')}
            onChange={(e) => handleChange('allergens', e.target.value.split(',').map(a => a.trim()))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
