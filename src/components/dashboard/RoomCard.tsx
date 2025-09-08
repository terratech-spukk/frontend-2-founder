"use client";

import { useState } from "react";
import { Room } from "@/types/room";
import { ReservationModal } from "./ReservationModal";
import { QRCodeSVG } from "qrcode.react";

interface RoomCardProps {
  room: Room;
  onReserve?: (roomId: number, guestData: { full_name: string; phone_number: string }) => void;
  onCancel?: (roomId: number) => void;
  onShowQR?: (roomId: number) => void;
  onCheckin?: (roomId: number) => void;
  onCheckout?: (roomId: number) => void;
}

export function RoomCard({ room, onReserve, onCancel, onShowQR, onCheckin, onCheckout }: RoomCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);

  const handleReserveClick = () => {
    setIsModalOpen(true);
  };


  const handleShowQRClick = () => {
    if (onShowQR) {
      onShowQR(room.room_number);
    } else {
      // Fallback: show QR popup directly on the card
      setShowQRPopup(true);
    }
  };

  const handleCloseQRPopup = () => {
    setShowQRPopup(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleConfirmReservation = (roomNumber: number, guestData: { full_name: string; phone_number: string }) => {
    if (onReserve) {
      onReserve(roomNumber, guestData);
    }
    setIsModalOpen(false);
  };
  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800";
      case "reserve":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "checkin":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "checkout":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "unavailable":
        return "bg-gray-100 border-gray-300 text-gray-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "Available";
      case "reserve":
        return "Reserved";
      case "checkin":
        return "Checked In";
      case "checkout":
        return "Checked Out";
      case "unavailable":
        return "Unavailable";
      default:
        return "Unknown";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Room {room.room_number}
          </h3>
          <p className="text-gray-600 mt-1">{room.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(room.status)}`}>
          {getStatusText(room.status)}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-[#cfa349]">
          {formatPrice(room.price)}
        </p>
        <p className="text-sm text-gray-500">per night</p>
      </div>

      {/* Current Guest Information */}
      {room.current_guest && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-blue-800">Current Guest:</span>
          </div>
          <p className="text-blue-700 font-semibold mt-1">{room.current_guest}</p>
        </div>
      )}

      {!room.current_guest && room.status === "reserve" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-yellow-800">Reserved</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">No guest assigned yet</p>
        </div>
      )}

      <div className="flex gap-2">
        {room.status === "available" && onReserve && (
          <button
            onClick={handleReserveClick}
            className="flex-1 bg-[#cfa349] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b8903e] transition-colors"
          >
            Reserve
          </button>
        )}
        
        {room.status === "reserve" && (
          <div className="flex gap-2 w-full">
            {onShowQR && (
              <button
                onClick={handleShowQRClick}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Show QR Code
              </button>
            )}
            {onCheckin && (
              <button
                onClick={() => onCheckin(room.room_number)}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Check In
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(room.room_number)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
        
        {room.status === "checkin" && (
          <div className="flex gap-2 w-full">
            {onShowQR && (
              <button
                onClick={handleShowQRClick}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Show QR Code
              </button>
            )}
            {onCheckout && (
              <button
                onClick={() => onCheckout(room.room_number)}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Check Out
              </button>
            )}
          </div>
        )}
        
        {room.status === "unavailable" && (
          <button
            disabled
            className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>

      <ReservationModal
        room={room}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleConfirmReservation}
      />

      {/* QR Code Popup */}
      {showQRPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Room {room.room_number} - QR Code
              </h3>
              <button
                onClick={handleCloseQRPopup}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {room.qrcode_base64 ? (
              <div className="text-center">
                <img 
                  src={room.qrcode_base64} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto mb-4 object-contain"
                />
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code to auto-login
                </p>
                {room.qr_code_data && (
                  <div className="text-xs text-gray-500">
                    <p><strong>Username:</strong> {JSON.parse(room.qr_code_data).username}</p>
                    <p><strong>Password:</strong> {JSON.parse(room.qr_code_data).password}</p>
                    {JSON.parse(room.qr_code_data).full_name && (
                      <>
                        <p><strong>Name:</strong> {JSON.parse(room.qr_code_data).full_name}</p>
                        <p><strong>Phone:</strong> {JSON.parse(room.qr_code_data).phone_number}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
                  <QRCodeSVG
                    value={`${window.location.origin}/login/qrcode?loginname=${encodeURIComponent(room.current_guest || '')}&password=123`}
                    size={150}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code to auto-login
                </p>
                <div className="text-xs text-gray-500">
                  <p><strong>Username:</strong> {room.current_guest}</p>
                  <p><strong>Password:</strong> 123</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCloseQRPopup}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const url = room.qr_code_data 
                    ? JSON.parse(room.qr_code_data).autoLoginUrl 
                    : `${window.location.origin}/login/qrcode?loginname=${encodeURIComponent(room.current_guest || '')}&password=123`;
                  navigator.clipboard.writeText(url);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
