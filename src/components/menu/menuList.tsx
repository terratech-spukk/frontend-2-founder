"use client"

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MenuItem, ApiResponse } from '@/types/menu';
import { categories } from '@/data/food_categories';
import { api } from '@/lib/axios';


const FoodMenuPage = () => {
  const router = useRouter();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [showPopularOnly, setShowPopularOnly] = useState<boolean>(false);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMenus = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<MenuItem[]> | MenuItem[]>(`/food-menus/`);
        
        // Handle both possible response structures
        const menuData = Array.isArray(response.data) ? response.data : response.data.data;
        setMenus(menuData);
        setError(null);
        
        // Set initial price range based on actual data
        if (menuData.length > 0) {
          const prices = menuData.map(menu => menu.price);
          setMaxPrice(Math.max(...prices));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu data';
        setError(errorMessage);
        console.error('Error fetching menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const getSpiceLevel = (level: number): string => {
    return '🌶️'.repeat(level);
  };

  const handleImageError = (imageUrl: string): void => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
  };

  const getImageSrc = (menu: MenuItem): string => {
    return failedImages.has(menu.image) ? 'https://placehold.co/1200x768' : menu.image;
  };

  // Filter menus based on search query, price range, popular filter, spice level, and category - optimized for instant updates
  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      const matchesSearch = searchQuery === '' || 
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.name_en.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = menu.price >= minPrice && menu.price <= maxPrice;
      const matchesPopular = !showPopularOnly || menu.is_popular;
      const matchesSpice = selectedSpiceLevels.size === 0 || selectedSpiceLevels.has(menu.spice_level);
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(menu.category_id);
      return matchesSearch && matchesPrice && matchesPopular && matchesSpice && matchesCategory;
    });
  }, [menus, searchQuery, minPrice, maxPrice, showPopularOnly, selectedSpiceLevels, selectedCategories]);

  // Calculate price range from actual menu data
  const priceRange = menus.length > 0 ? {
    min: Math.min(...menus.map(menu => menu.price)),
    max: Math.max(...menus.map(menu => menu.price))
  } : { min: 0, max: 1000 };

  // Get unique spice levels from menu data
  const availableSpiceLevels = useMemo(() => {
    const levels = new Set(menus.map(menu => menu.spice_level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [menus]);

  // Handle spice level checkbox changes
  const handleSpiceLevelChange = (level: number, checked: boolean) => {
    setSelectedSpiceLevels(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(level);
      } else {
        newSet.delete(level);
      }
      return newSet;
    });
  };

  // Handle category checkbox changes
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(categoryId);
      } else {
        newSet.delete(categoryId);
      }
      return newSet;
    });
  };

  // Handle card click to navigate to detail page
  const handleCardClick = (menuId: string) => {
    router.push(`/menu/${menuId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Menu</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen z-10 bg-[url('/bg_hotel.png')] bg-no-repeat bg-cover bg-center bg-fixed">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
          <p className="mt-2 text-gray-600">เมนูอาหารของเรา</p>
          

              
            </div>
          </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Price Range Filter */}
          <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            {/* Search Input */}
            <div className="text-lg font-semibold text-gray-900 mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาอาหาร... / Search food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Popular Filter Toggle */}
              <div className="flex items-center font-semibold sticky">
                <button
                  onClick={() => setShowPopularOnly(!showPopularOnly)}
                  className={`flex items-center lg:px-8 lg:py-3 rounded-lg border transition-all duration-200 ${
                    showPopularOnly
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <svg 
                    className={`w-5 h-5 mr-2 ${showPopularOnly ? 'text-white' : 'text-orange-500'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">
                    {showPopularOnly ? 'Show All' : 'Popular Only'}
                  </span>
                  <span className="ml-1 text-xs opacity-75">
                    {showPopularOnly ? 'แสดงทั้งหมด' : 'ยอดนิยมเท่านั้น'}
                  </span>
                </button>
              </div>
            
              {/* Price Display */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range / ช่วงราคา</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>฿{minPrice}</span>
                <span>฿{maxPrice}</span>
              </div>
              
              {/* Price Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price / ราคาต่ำสุด</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={minPrice}
                    onChange={(e) => {
                      const newMinPrice = Math.min(Number(e.target.value), maxPrice - 1);
                      setMinPrice(newMinPrice);
                    }}
                    onInput={(e) => {
                      const newMinPrice = Math.min(Number((e.target as HTMLInputElement).value), maxPrice - 1);
                      setMinPrice(newMinPrice);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price / ราคาสูงสุด</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={maxPrice}
                    onChange={(e) => {
                      const newMaxPrice = Math.max(Number(e.target.value), minPrice + 1);
                      setMaxPrice(newMaxPrice);
                    }}
                    onInput={(e) => {
                      const newMaxPrice = Math.max(Number((e.target as HTMLInputElement).value), minPrice + 1);
                      setMaxPrice(newMaxPrice);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Category / หมวดหมู่</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(category.id)}
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">{category.name_en}</span>
                        <span className="text-gray-500 ml-1">/ {category.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Spice Level Filter */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Spice Level / ระดับความเผ็ด</h4>
                <div className="space-y-2">
                  {availableSpiceLevels.map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSpiceLevels.has(level)}
                        onChange={(e) => handleSpiceLevelChange(level, e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        {getSpiceLevel(level)} 
                        <span className="ml-1">
                          {level === 0 ? 'No Spice / ไม่เผ็ด' : 
                           level === 1 ? 'Mild / เผ็ดน้อย' :
                           level === 2 ? 'Medium / เผ็ดปานกลาง' :
                           level === 3 ? 'Hot / เผ็ดมาก' :
                           level === 4 ? 'Very Hot / เผ็ดมากๆ' :
                           `Level ${level} / ระดับ ${level}`}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setMinPrice(0);
                  setMaxPrice(priceRange.max);
                  setShowPopularOnly(false);
                  setSelectedSpiceLevels(new Set());
                  setSelectedCategories(new Set());
                }}
                className="w-full mt-6 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Reset Filters / รีเซ็ตตัวกรอง
              </button>
            </div>
          </div>

          {/* Main Content - Menu Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer"
              onClick={() => handleCardClick(menu.id)}
            >
              {/* Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={getImageSrc(menu)}
                  alt={menu.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => handleImageError(menu.image)}
                />
                {menu.is_popular && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Title and Price */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                    <p className="text-sm text-gray-500">{menu.name_en}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-orange-600">฿{menu.price}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{menu.description}</p>

                {/* Spice Level */}
                {menu.spice_level > 0 && (
                  <div className="flex items-center mb-3">
                    <span className="text-sm text-gray-600 mr-2">ระดับความเผ็ด:</span>
                    <span className="text-sm">{getSpiceLevel(menu.spice_level)}</span>
                  </div>
                )}

                {/* Ingredients */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">ส่วนประกอบ:</h4>
                  <div className="flex flex-wrap gap-1">
                    {menu.ingredients.slice(0, 3).map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                    {menu.ingredients.length > 3 && (
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        +{menu.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Allergens */}
                {menu.allergens.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-600 mb-1">ข้อมูลสำหรับผู้แพ้อาหาร:</h4>
                    <div className="flex flex-wrap gap-1">
                      {menu.allergens.map((allergen: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full"
                        >
                          มีส่วนผสมของ{allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button - Sticky to Footer */}
                <div className="mt-auto pt-4">
                  <button 
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle add to cart logic here
                      console.log('Add to cart:', menu.id);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            ))}
            </div>

            {filteredMenus.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery || showPopularOnly ? 'No Menu Items Found' : 'No Menu Items Available'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No items found for "${searchQuery}". Try a different search term.`
                    : showPopularOnly || selectedSpiceLevels.size > 0 || selectedCategories.size > 0
                    ? 'No items found matching your filters. Try adjusting your filters.'
                    : 'Please check back later for our delicious menu items.'
                  }
                </p>
                {(searchQuery || showPopularOnly || selectedSpiceLevels.size > 0 || selectedCategories.size > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowPopularOnly(false);
                      setSelectedSpiceLevels(new Set());
                      setSelectedCategories(new Set());
                    }}
                    className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export { FoodMenuPage };