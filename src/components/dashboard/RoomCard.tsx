"use client";

import { useState } from "react";
import { Room } from "@/types/room";
import { ReservationModal } from "./ReservationModal";

interface RoomCardProps {
  room: Room;
  onReserve?: (roomId: number, username: string) => void;
  onCancel?: (roomId: number) => void;
}

export function RoomCard({ room, onReserve, onCancel }: RoomCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReserveClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleConfirmReservation = (roomNumber: number, username: string) => {
    if (onReserve) {
      onReserve(roomNumber, username);
    }
    setIsModalOpen(false);
  };
  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800";
      case "reserve":
        return "bg-blue-100 border-blue-300 text-blue-800";
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
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
        
        {room.status === "reserve" && onCancel && (
          <button
            onClick={() => onCancel(room.room_number)}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Cancel Reservation
          </button>
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
    </div>
  );
}
