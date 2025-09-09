"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

const HotelListPage = () => {
  const [hotels] = useState([
    {
      id: "fbe3",
      name: "โรงแรมเซ็นทรัล แกรนด์ กรุงเทพ",
      type: "hotel",
      location: {
        city: "กรุงเทพมหานคร",
        district: "ปทุมวัน",
        address: "999/99 ถนนราชดำริ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330",
        coordinates: {
          lat: 13.7463,
          lng: 100.5398,
        },
      },
      description:
        "โรงแรมหรู 5 ดาวใจกลางกรุงเทพฯ ใกล้ BTS ชิดลม พร้อมสิ่งอำนวยความสะดวกครบครัน",
      amenities: [
        "WiFi ฟรี",
        "สระว่ายน้ำ",
        "ฟิตเนส",
        "สปา",
        "ห้องอาหาร",
        "ที่จอดรถ",
        "แอร์",
        "มินิบาร์",
      ],
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
        "https://images.unsplash.com/photo-1578774204375-8f2c5bb90229?w=800",
      ],
      rating: 4.8,
      reviews: 1247,
      price_per_night: 3500,
      currency: "THB",
      rooms_available: 12,
      check_in: "14:00",
      check_out: "12:00",
      cancellation_policy: "ยกเลิกฟรี 24 ชั่วโมงก่อนเช็คอิน",
      contact: {
        phone: "02-123-4567",
        email: "info@centralgrandbkk.com",
      },
    },
    {
      id: "eae7",
      name: "วิลล่าสีฟ้า ชะอำ",
      type: "villa",
      location: {
        city: "เพชรบุรี",
        district: "ชะอำ",
        address: "88/1 หมู่ 3 ต.ชะอำ อ.ชะอำ จ.เพชรบุรี 76120",
        coordinates: {
          lat: 12.7885,
          lng: 99.9661,
        },
      },
      description:
        "วิลล่าส่วนตัวริมทะเลชะอำ พร้อมสระว่ายน้ำส่วนตัว เหมาะสำหรับครอบครัว",
      amenities: [
        "WiFi ฟรี",
        "สระว่ายน้ำส่วนตัว",
        "ครัวส่วนตัว",
        "ที่จอดรถ",
        "แอร์",
        "เตียงพิเศษ",
        "ริมทะเล",
      ],
      images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      ],
      rating: 4.6,
      reviews: 89,
      price_per_night: 2800,
      currency: "THB",
      rooms_available: 3,
      check_in: "15:00",
      check_out: "11:00",
      cancellation_policy: "ไม่สามารถยกเลิกได้",
      contact: {
        phone: "032-555-0123",
        email: "booking@bluevilla.com",
      },
    },
  ]);

  // Function to get a random image from the images array
  const getRandomImage = (images: string[]) => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  // Function to format price with comma separator
  const formatPrice = (price: number) => {
    return price.toLocaleString("th-TH");
  };

  // Function to get type badge styling
  const getTypeBadge = (type: string) => {
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (type) {
      case "hotel":
        return `${baseClass} bg-blue-100 text-blue-800`;
      case "villa":
        return `${baseClass} bg-green-100 text-green-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            รายการโรงแรมและที่พัก
          </h1>
          <p className="text-gray-600">ค้นหาที่พักที่เหมาะสมสำหรับคุณ</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ที่พัก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคา/คืน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Image
                            className="h-20 w-20 rounded-lg object-cover"
                            src={getRandomImage(hotel.images)}
                            alt={hotel.name}
                            width={800}
                            height={800}
                            onError={(
                              e: React.SyntheticEvent<HTMLImageElement>,
                            ) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {hotel.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {hotel.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTypeBadge(hotel.type)}>
                        {hotel.type === "hotel" ? "โรงแรม" : "วิลล่า"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {hotel.location.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {hotel.location.district}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {hotel.rating}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({hotel.reviews} รีวิว)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        ฿{formatPrice(hotel.price_per_night)}
                      </div>
                      <div className="text-sm text-gray-500">ต่อคืน</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบข้อมูลที่พัก</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelListPage;
