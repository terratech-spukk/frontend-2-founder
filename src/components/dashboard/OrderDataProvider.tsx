"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Order } from "@/types/order";
import { api } from "@/lib/axios";

interface OrderDataContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const OrderDataContext = createContext<OrderDataContextType | undefined>(
  undefined,
);

interface OrderDataProviderProps {
  children: ReactNode;
  onError?: (error: string) => void;
}

export function OrderDataProvider({
  children,
  onError,
}: OrderDataProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/food-orders", {});

      if (response.status !== 200) {
        throw new Error("Failed to fetch orders");
      }

      const data = response.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refetch = () => {
    fetchOrders();
  };

  return (
    <OrderDataContext.Provider value={{ orders, loading, error, refetch }}>
      {children}
    </OrderDataContext.Provider>
  );
}

export function useOrderData() {
  const context = useContext(OrderDataContext);
  if (context === undefined) {
    throw new Error("useOrderData must be used within an OrderDataProvider");
  }
  return context;
}
