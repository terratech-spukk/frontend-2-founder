import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '../../base';
import { Order, OrderItem } from '@/types/order';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { items, totals, room } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Generate order ID with timestamp
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const orderId = `order_${dateStr}_${timeStr}`;

    // Transform cart items to order items
    const orderItems: OrderItem[] = items.map((item: any) => ({
      menu_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price_each: item.price,
      total_price: item.price * item.quantity,
      note: item.note || undefined,
    }));

    // Create order data
    const orderData: Order = {
      id: orderId,
      room_id: parseInt(room) || parseInt(user.room_id || '495'), // Use user's room or provided room
      status: 'pending',
      items: orderItems,
      total_amount: totals?.grandTotal || orderItems.reduce((sum, item) => sum + item.total_price, 0),
      created_at: now.toISOString(),
      created_by: user.id,
    };

    // Send order to food-orders API
    const response = await fetch(`${API_BASE}/food-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role || 'guest',
        'x-user-room_id': user.room_id || '495',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Food orders API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to create order',
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      ok: true,
      order: orderData,
      response: result,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve orders (optional)
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const status = searchParams.get('status');

    // Build query string
    const queryParams = new URLSearchParams();
    if (roomId) queryParams.append('room_id', roomId);
    if (status) queryParams.append('status', status);

    // Fetch orders from food-orders API
    const response = await fetch(`${API_BASE}/food-orders?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'x-user-id': user.id,
        'x-user-role': user.role || 'guest',
        'x-user-room_id': user.room_id || '495',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: response.status }
      );
    }

    const orders = await response.json();
    return NextResponse.json(orders);

  } catch (error) {
    console.error('Order fetch error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
