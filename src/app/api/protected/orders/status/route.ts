import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '../../../base';
import { OrderStatus } from '@/types/order';

interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
}

export async function PATCH(request: NextRequest) {
  try {
    // Get user from headers
    const user = {
      id: request.headers.get("x-user-id"),
      role: request.headers.get("x-user-role"),
      room_id: request.headers.get("x-user-room_id"),
    };
    
    if (!user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: OrderStatusUpdate = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'cooking', 'serve'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, cooking, or serve' },
        { status: 400 }
      );
    }

    // Update order status via food-orders API
    const response = await fetch(`${API_BASE}/food-orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role || 'admin',
        'x-user-room_id': user.room_id || '495',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Food orders API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to update order status',
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      ok: true,
      orderId,
      status,
      response: result,
    });

  } catch (error) {
    console.error('Order status update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
