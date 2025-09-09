# Dashboard Components

This directory contains modular components for the admin dashboard functionality.

## Components

### OrderManagement

- **File**: `OrderManagement.tsx`
- **Purpose**: Manages food orders with filtering, searching, and status updates
- **Features**:
  - Order filtering (All, Pending, Cooking, Ready)
  - Search by Order ID or User
  - Order status updates
  - Order details display

### HotelRoomManagement

- **File**: `HotelRoomManagement.tsx`
- **Purpose**: Manages hotel room reservations and operations
- **Features**:
  - Room reservation with guest details
  - Check-in/Check-out functionality
  - QR code generation and display
  - Room status management
  - Reservation cancellation

### BookingAnalytics

- **File**: `BookingAnalytics.tsx`
- **Purpose**: Provides analytics and insights for booking data
- **Features**:
  - Income tracking (total and expected)
  - Status distribution charts
  - Revenue charts over time
  - Room occupancy statistics
  - Date range filtering

### BookingList

- **File**: `BookingList.tsx`
- **Purpose**: Displays a detailed list of all bookings
- **Features**:
  - Tabular booking data display
  - Date range filtering
  - Status indicators
  - Guest information

### RoomCard

- **File**: `RoomCard.tsx`
- **Purpose**: Individual room display card with actions
- **Features**:
  - Room status display
  - Action buttons (Reserve, Check-in, Check-out, Cancel)
  - QR code display
  - Guest information

### QRCodeModal

- **File**: `QRCodeModal.tsx`
- **Purpose**: Modal for displaying QR codes and credentials
- **Features**:
  - QR code generation
  - Credential display
  - Auto-login URL

### ReservationModal

- **File**: `ReservationModal.tsx`
- **Purpose**: Modal for creating room reservations
- **Features**:
  - Guest information form
  - Room details display
  - Form validation

## Usage

### In Dashboard Page

```tsx
import { OrderManagement } from "@/components/dashboard";

<OrderManagement onError={handleError} />;
```

### In Activity Page

```tsx
import { HotelRoomManagement, BookingAnalytics, BookingList } from "@/components/dashboard";

<HotelRoomManagement onError={handleError} />
<BookingAnalytics onError={handleError} />
<BookingList onError={handleError} />
```

## Props

All components accept an optional `onError` prop for error handling:

```tsx
interface ComponentProps {
  onError?: (error: string) => void;
}
```

## Error Handling

Components handle their own loading states and errors internally, but also provide an `onError` callback for parent components to handle errors globally.

## Dependencies

- React hooks (useState, useEffect, useMemo)
- Next.js (useRouter)
- Custom hooks (useSession)
- API utilities (api from @/lib/axios)
- UI components (addToast from @heroui/react)
- Chart libraries (recharts)
- QR code generation (qrcode.react)
