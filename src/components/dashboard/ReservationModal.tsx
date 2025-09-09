"use client";

import { useState } from "react";
import { Room } from "@/types/room";

interface ReservationModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    roomNumber: number,
    guestData: { full_name: string; phone_number: string },
  ) => void;
  isLoading?: boolean;
}

export function ReservationModal({
  room,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ReservationModalProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && phoneNumber.trim()) {
      onConfirm(room.room_number, {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });
    }
  };

  const handleClose = () => {
    setFullName("");
    setPhoneNumber("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Reserve Room {room.room_number}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">{room.description}</p>
          <p className="text-lg font-semibold text-[#cfa349]">
            {new Intl.NumberFormat("th-TH", {
              style: "currency",
              currency: "THB",
              minimumFractionDigits: 0,
            }).format(room.price)}{" "}
            per night
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Guest Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter guest full name"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfa349] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cfa349] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !fullName.trim() || !phoneNumber.trim()}
              className="flex-1 px-4 py-2 bg-[#cfa349] text-white rounded-lg hover:bg-[#b8903e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Reserving..." : "Reserve Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
