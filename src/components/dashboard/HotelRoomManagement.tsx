"use client";

import { useState, useEffect } from "react";
import { Room } from "@/types/room";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { QRCodeModal } from "@/components/dashboard/QRCodeModal";
import { api } from "@/lib/axios";
import { addToast } from "@heroui/react";

interface ApiError {
    response?: {
        data?: {
            error?: string;
        };
    };
    message?: string;
}

interface HotelRoomManagementProps {
    onError?: (error: string) => void;
}

export function HotelRoomManagement({ onError }: HotelRoomManagementProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrCredentials, setQrCredentials] = useState<{
        username: string;
        password: string;
        autoLoginUrl: string;
        qrCodeData?: {
            username: string;
            password: string;
            autoLoginUrl: string;
            qrCodeImage?: string;
            full_name?: string;
            phone_number?: string;
        };
    } | null>(null);
    const [qrRoomNumber, setQrRoomNumber] = useState<number | null>(null);

    // Fetch room data from API
    const fetchRooms = async () => {
        setRoomsLoading(true);
        setRoomsError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/hotel-rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            // console.log('Fetched rooms data:', response.data);
            setRooms(response.data);
        } catch (error: unknown) {
            console.error('Error fetching rooms:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError?.response?.data?.error || apiError?.message || 'Failed to load room data. Please try again.';
            setRoomsError(errorMessage);
            onError?.(errorMessage);
            
            addToast({
                title: "Loading Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
        } finally {
            setRoomsLoading(false);
        }
    };

    const handleReserve = async (roomNumber: number, guestData: { full_name: string; phone_number: string }) => {
        try {
            const room = rooms.find(r => r.room_number === roomNumber);
            if (!room) {
                console.error('Room not found');
                return;
            }
            
            addToast({
                title: "Reserving Room",
                description: `Reserving room ${roomNumber} for ${guestData.full_name}...`,
                color: "primary",
                timeout: 3000,
            });
            
            const token = localStorage.getItem("token");
            const response = await fetch("/api/protected/hotel/reserve", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    hotel_room_id: room.id, 
                    full_name: guestData.full_name,
                    phone_number: guestData.phone_number
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            addToast({
                title: "Reservation Successful",
                description: `Room ${roomNumber} has been reserved with auto-generated credentials`,
                color: "success",
                timeout: 4000,
            });
            
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.room_number === roomNumber 
                        ? { 
                            ...room, 
                            status: "reserve" as const, 
                            current_guest: responseData.credentials.username,
                            qrcode_base64: responseData.credentials.qrCodeData.qrCodeImage,
                            qr_code_data: JSON.stringify(responseData.credentials.qrCodeData)
                          }
                        : room
                )
            );
            
            setQrCredentials(responseData.credentials);
            setQrRoomNumber(roomNumber);
            setQrModalOpen(true);
            
            // console.log(`Room ${roomNumber} reserved successfully with credentials:`, responseData.credentials);
        } catch (error: unknown) {
            console.error('Error reserving room:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || 'Failed to reserve the room. Please try again.';
            
            addToast({
                title: "Reservation Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
            
            fetchRooms();
        }
    };

    const handleShowQR = async (roomNumber: number) => {
        try {
            const room = rooms.find(r => r.room_number === roomNumber);
            // console.log('Room data:', room);
            
            if (!room?.current_guest) {
                console.error('No current guest found for room');
                return;
            }
            
            if (room.qrcode_base64 && room.qr_code_data) {
                const qrCodeData = JSON.parse(room.qr_code_data);
                
                setQrCredentials({
                    username: qrCodeData.username,
                    password: qrCodeData.password,
                    autoLoginUrl: qrCodeData.autoLoginUrl,
                    qrCodeData: {
                        ...qrCodeData,
                        qrCodeImage: room.qrcode_base64
                    }
                });
                setQrRoomNumber(roomNumber);
                setQrModalOpen(true);
            } else {
                // console.log('QR code data not found in local state, fetching from API...');
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/protected/hotel/rooms/${room.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const freshRoomData = await response.json();
                    // console.log('Fresh room data:', freshRoomData);
                    
                    if (freshRoomData.qrcode_base64 && freshRoomData.qr_code_data) {
                        const qrCodeData = JSON.parse(freshRoomData.qr_code_data);
                        
                        setQrCredentials({
                            username: qrCodeData.username,
                            password: qrCodeData.password,
                            autoLoginUrl: qrCodeData.autoLoginUrl,
                            qrCodeData: {
                                ...qrCodeData,
                                qrCodeImage: freshRoomData.qrcode_base64
                            }
                        });
                        setQrRoomNumber(roomNumber);
                        setQrModalOpen(true);
                        return;
                    }
                }
                
                // console.log('No QR code data found, attempting to generate from username...');
                const username = room.current_guest;
                const baseUrl = window.location.origin;
                const autoLoginUrl = `${baseUrl}/login/qrcode?loginname=${encodeURIComponent(username)}&password=123`;
                
                setQrCredentials({
                    username: username,
                    password: "123",
                    autoLoginUrl: autoLoginUrl,
                    qrCodeData: {
                        username: username,
                        password: "123",
                        autoLoginUrl: autoLoginUrl,
                        qrCodeImage: ""
                    }
                });
                setQrRoomNumber(roomNumber);
                setQrModalOpen(true);
            }
        } catch (error: unknown) {
            console.error('Error fetching QR code:', error);
            addToast({
                title: "Error",
                description: "Failed to load QR code data",
                color: "danger",
                timeout: 4000,
            });
        }
    };

    const handleCheckin = async (roomNumber: number) => {
        try {
            const room = rooms.find(r => r.room_number === roomNumber);
            if (!room) {
                console.error('Room not found');
                return;
            }
            
            addToast({
                title: "Checking In",
                description: `Checking in room ${roomNumber}...`,
                color: "primary",
                timeout: 3000,
            });
            
            const token = localStorage.getItem("token");
            const response = await fetch("/api/protected/hotel/checkin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ hotel_room_id: room.id })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.room_number === roomNumber 
                        ? { ...room, status: "checkin" as const }
                        : room
                )
            );
            
            addToast({
                title: "Check-in Successful",
                description: `Room ${roomNumber} has been checked in`,
                color: "success",
                timeout: 4000,
            });
            
            // console.log(`Room ${roomNumber} checked in successfully`);
        } catch (error: unknown) {
            console.error('Error checking in room:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || 'Failed to check in the room. Please try again.';
            
            addToast({
                title: "Check-in Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
            
            fetchRooms();
        }
    };

    const handleCheckout = async (roomNumber: number) => {
        try {
            const room = rooms.find(r => r.room_number === roomNumber);
            if (!room) {
                console.error('Room not found');
                return;
            }
            
            addToast({
                title: "Checking Out",
                description: `Checking out room ${roomNumber}...`,
                color: "primary",
                timeout: 3000,
            });
            
            const token = localStorage.getItem("token");
            const response = await fetch("/api/protected/hotel/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ hotel_room_id: room.id })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.room_number === roomNumber 
                        ? { 
                            ...room, 
                            status: "available" as const, 
                            current_guest: null,
                            qrcode_base64: null,
                            qr_code_data: null
                          }
                        : room
                )
            );
            
            addToast({
                title: "Check-out Successful",
                description: `Room ${roomNumber} has been checked out`,
                color: "success",
                timeout: 4000,
            });
            
            // console.log(`Room ${roomNumber} checked out successfully`);
        } catch (error: unknown) {
            console.error('Error checking out room:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || 'Failed to check out the room. Please try again.';
            
            addToast({
                title: "Check-out Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
            
            fetchRooms();
        }
    };

    const handleCancel = async (roomNumber: number) => {
        try {
            const room = rooms.find(r => r.room_number === roomNumber);
            if (!room?.current_guest) {
                console.error('No current guest found for room');
                return;
            }
            
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.room_number === roomNumber 
                        ? { ...room, status: "available" as const, current_guest: null }
                        : room
                )
            );
            
            const token = localStorage.getItem("token");
            const response = await fetch("/api/protected/hotel/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ hotel_room_id: room.id, username: room.current_guest })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            addToast({
                title: "Cancellation Successful",
                description: `Reservation for room ${roomNumber} has been cancelled`,
                color: "success",
                timeout: 4000,
            });
            
            // console.log(`Reservation for room ${roomNumber} cancelled successfully`);
        } catch (error: unknown) {
            console.error('Error cancelling reservation:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || 'Failed to cancel the reservation. Please try again.';
            
            addToast({
                title: "Cancellation Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
            
            fetchRooms();
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Hotel Room Management</h2>
                    <button
                        onClick={fetchRooms}
                        disabled={roomsLoading}
                        className="px-4 py-2 bg-[#cfa349] text-white rounded-lg hover:bg-[#b8903e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {roomsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {roomsError && (
                <div className="p-6">
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                        {roomsError}
                    </div>
                </div>
            )}

            {roomsLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-lg text-gray-600">Loading rooms...</div>
                </div>
            ) : (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onReserve={handleReserve}
                                onCancel={handleCancel}
                                onShowQR={handleShowQR}
                                onCheckin={handleCheckin}
                                onCheckout={handleCheckout}
                            />
                        ))}
                    </div>

                    {!roomsLoading && rooms.length === 0 && !roomsError && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No rooms available</p>
                        </div>
                    )}
                </div>
            )}

            {/* QR Code Modal */}
            {qrCredentials && qrRoomNumber && (
                <QRCodeModal
                    isOpen={qrModalOpen}
                    onClose={() => {
                        setQrModalOpen(false);
                        setQrCredentials(null);
                        setQrRoomNumber(null);
                    }}
                    credentials={qrCredentials}
                    roomNumber={qrRoomNumber}
                />
            )}
        </div>
    );
}
