export interface OrderItem {
  menu_id: string;
  name: string;
  quantity: number;
  price_each: number;
  total_price: number;
  note?: string;
}

export interface Order {
  id: string;
  room_id: number;
  status: 'pending' | 'cooking' | 'serve';
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  created_by: string;
}

export type OrderStatus = 'pending' | 'cooking' | 'serve';

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
}
