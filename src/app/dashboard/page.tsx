"use client";

import { useSession } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { QRCodeModal } from "@/components/dashboard/QRCodeModal";
import { Room } from "@/types/room";
import { api } from "@/lib/axios";
import { addToast } from "@heroui/react";

export default function DashboardPage() {
    const { user, isLoading } = useSession();
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrCredentials, setQrCredentials] = useState<{
        username: string;
        password: string;
        autoLoginUrl: string;
        qrCodeData?: any;
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
            console.log('Fetched rooms data:', response.data); // Debug log
            setRooms(response.data);
            
            // Show success toast for room loading
        } catch (error: any) {
            console.error('Error fetching rooms:', error);
            const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load room data. Please try again.';
            setRoomsError(errorMessage);
            
            // Show error toast for room loading failure
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

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleReserve = async (roomNumber: number, guestData: { full_name: string; phone_number: string }) => {
        try {
            // Find the room by room_number to get the id
            const room = rooms.find(r => r.room_number === roomNumber);
            if (!room) {
                console.error('Room not found');
                return;
            }
            
            // Show loading state
            addToast({
                title: "Reserving Room",
                description: `Reserving room ${roomNumber} for ${guestData.full_name}...`,
                color: "primary",
                timeout: 3000,
            });
            
            // Make API call to reserve room with authorization header
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
            
            // Show success toast
            addToast({
                title: "Reservation Successful",
                description: `Room ${roomNumber} has been reserved with auto-generated credentials`,
                color: "success",
                timeout: 4000,
            });
            
            // Update room with generated username and QR code data
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
            
            // Show QR code modal with credentials
            setQrCredentials(responseData.credentials);
            setQrRoomNumber(roomNumber);
            setQrModalOpen(true);
            
            console.log(`Room ${roomNumber} reserved successfully with credentials:`, responseData.credentials);
        } catch (error: any) {
            console.error('Error reserving room:', error);
            const errorMessage = error?.message || 'Failed to reserve the room. Please try again.';
            
            // Show error toast
            addToast({
                title: "Reservation Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
            
            // Revert UI change on error
            fetchRooms();
        }
    };

    const handleShowQR = async (roomNumber: number) => {
        try {
            // Find the room to get QR code data
            const room = rooms.find(r => r.room_number === roomNumber);
            console.log('Room data:', room); // Debug log
            
            if (!room?.current_guest) {
                console.error('No current guest found for room');
                return;
            }
            
            // Check if room has QR code data
            console.log('QR code fields:', {
                qrcode_base64: room.qrcode_base64,
                qr_code_data: room.qr_code_data
            }); // Debug log
            
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
                // Try to fetch fresh room data from API
                console.log('QR code data not found in local state, fetching from API...');
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/protected/hotel/rooms/${room.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const freshRoomData = await response.json();
                    console.log('Fresh room data:', freshRoomData);
                    
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
                
                // If no QR code data found, try to generate it from the current guest username
                console.log('No QR code data found, attempting to generate from username...');
                const username = room.current_guest;
                
                // Extract password from username if it follows the pattern room_XXX_timestamp
                // For now, we'll use a default password or try to extract it
                const baseUrl = window.location.origin;
                const autoLoginUrl = `${baseUrl}/login/qrcode?loginname=${encodeURIComponent(username)}&password=123`;
                
                setQrCredentials({
                    username: username,
                    password: "123", // Default password
                    autoLoginUrl: autoLoginUrl,
                    qrCodeData: {
                        username: username,
                        password: "123",
                        autoLoginUrl: autoLoginUrl,
                        qrCodeImage: "" // Will be generated by QRCodeModal
                    }
                });
                setQrRoomNumber(roomNumber);
                setQrModalOpen(true);
            }
        } catch (error: any) {
            console.error('Error fetching QR code:', error);
            addToast({
                title: "Error",
                description: "Failed to load QR code data",
                color: "danger",
                timeout: 4000,
            });
        }
    };

    const handleCancel = async (roomNumber: number) => {
        try {
            // Find the room to get the current guest
            const room = rooms.find(r => r.room_number === roomNumber);
            if (!room?.current_guest) {
                console.error('No current guest found for room');
                return;
            }
            
            // Update UI optimistically
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.room_number === roomNumber 
                        ? { ...room, status: "available" as const, current_guest: null }
                        : room
                )
            );
            
            // Make API call to cancel reservation with authorization header
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
            
            // Show success toast
            addToast({
                title: "Cancellation Successful",
                description: `Reservation for room ${roomNumber} has been cancelled`,
                color: "success",
                timeout: 4000,
            });
            
            console.log(`Reservation for room ${roomNumber} cancelled successfully`);
        } catch (error: any) {
            console.error('Error cancelling reservation:', error);
            const errorMessage = error?.message || 'Failed to cancel the reservation. Please try again.';
            
            // Show error toast
            addToast({
                title: "Cancellation Failed",
                description: errorMessage,
                color: "danger",
                timeout: 4000,
            });
            
            // Revert UI change on error
            fetchRooms();
        }
    };

    useEffect(() => {
        if (!isLoading) {
            // If user is not logged in, redirect to login
            if (!user) {
                router.push("/login");
                return;
            }
            
            // If user is not admin, redirect to menu
            if (user.role !== "admin") {
                router.push("/menu");
                return;
            }
        }
    }, [user, isLoading, router]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // If user is not logged in or not admin, don't render content
    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Welcome, {user.id}!</h2>
                <p className="text-gray-600">You have admin access to the dashboard.</p>
                <div className="mt-4">
                    <p><strong>Role:</strong> {user.role}</p>
                    {user.room_id && <p><strong>Room ID:</strong> {user.room_id}</p>}
                </div>
            </div>

            {/* Room Management Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Hotel Room Management</h2>
                    <button
                        onClick={fetchRooms}
                        disabled={roomsLoading}
                        className="px-4 py-2 bg-[#cfa349] text-white rounded-lg hover:bg-[#b8903e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {roomsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {roomsError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {roomsError}
                    </div>
                )}

                {roomsLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-lg text-gray-600">Loading rooms...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onReserve={handleReserve}
                                onCancel={handleCancel}
                                onShowQR={handleShowQR}
                            />
                        ))}
                    </div>
                )}

                {!roomsLoading && rooms.length === 0 && !roomsError && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No rooms available</p>
                    </div>
                )}
            </div>

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