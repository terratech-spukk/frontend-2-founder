"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Image from "next/image";
import { MenuItem, ApiResponse } from "@/types/menu";
import { categories } from "@/data/food_categories";
import { useCart } from "@/contexts/CartContext";
import { AddToCartModal } from "./AddToCartModal";

const FoodDetailPage = ({ menuId }: { menuId: string }) => {
  const router = useRouter();
  const { getItemQuantity } = useCart();
  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMenuDetail = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<MenuItem[]> | MenuItem[]>(
          `/food-menus/?id=${menuId}`,
        );

        // Handle both possible response structures
        const menuData = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        if (menuData && menuData.length > 0) {
          setMenu(menuData[0]);
          setError(null);
        } else {
          setError("Menu item not found");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch menu details";
        setError(errorMessage);
        console.error("Error fetching menu details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (menuId) {
      fetchMenuDetail();
    }
  }, [menuId]);

  const getSpiceLevel = (level: number): string => {
    return "🌶️".repeat(level);
  };

  const handleImageError = (): void => {
    setFailedImage(true);
  };

  const getImageSrc = (): string => {
    return failedImage ? "/notfound.png" : menu?.image || "/notfound.png";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category
      ? `${category.name_en} / ${category.name}`
      : "Unknown Category";
  };

  const handleAddToCart = () => {
    if (!menu) return;
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu details...</p>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Menu
          </h2>
          <p className="text-gray-600">{error || "Menu item not found"}</p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/bg_hotel.png')] bg-no-repeat bg-cover bg-center bg-fixed">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Menu
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{menu.name}</h1>
          <p className="mt-2 text-gray-600">{menu.name_en}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={getImageSrc()}
                alt={menu.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={handleImageError}
                unoptimized={failedImage}
              />
              {menu.is_popular && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Price and Category */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-orange-600">
                  ฿{menu.price}
                </h2>
                <p className="text-gray-600 mt-1">
                  {getCategoryName(menu.category_id)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description / คำอธิบาย
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {menu.description}
              </p>
            </div>

            {/* Spice Level */}
            {menu.spice_level > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Spice Level / ระดับความเผ็ด
                </h3>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {getSpiceLevel(menu.spice_level)}
                  </span>
                  <span className="text-gray-700">
                    {menu.spice_level === 1
                      ? "Mild / เผ็ดน้อย"
                      : menu.spice_level === 2
                        ? "Medium / เผ็ดปานกลาง"
                        : menu.spice_level === 3
                          ? "Hot / เผ็ดมาก"
                          : menu.spice_level === 4
                            ? "Very Hot / เผ็ดมากๆ"
                            : `Level ${menu.spice_level} / ระดับ ${menu.spice_level}`}
                  </span>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Ingredients / ส่วนประกอบ
              </h3>
              <div className="flex flex-wrap gap-2">
                {menu.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens */}
            {menu.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-3">
                  Allergen Information / ข้อมูลสำหรับผู้แพ้อาหาร
                </h3>
                <div className="flex flex-wrap gap-2">
                  {menu.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="inline-block bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full"
                    >
                      มีส่วนผสมของ{allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-lg font-semibold text-gray-900">
                  Quantity / จำนวน:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium text-lg"
              >
                {getItemQuantity(menu.id) > 0
                  ? `Add to Cart (${getItemQuantity(menu.id)}) - ฿${menu.price * quantity}`
                  : `Add to Cart - ฿${menu.price * quantity}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        menuItem={menu}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </div>
  );
};

export { FoodDetailPage };
