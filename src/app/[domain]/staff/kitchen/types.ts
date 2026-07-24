export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  ticket_status: number; // 1 = pending, 4 = served
}

export interface KitchenOrder {
  id: string;
  receipt_number: string;
  queue_number?: string;
  order_type: "Dine-in" | "Takeaway" | "Delivery";
  table_number?: string;
  customer_name?: string;
  fulfillment_status: number; // 1 = Preparing, 2 = Ready, 3 = Completed
  created_at: string;
  items: OrderItem[];
}

export interface KitchenStats {
  newOrders: number;
  preparing: number;
  completedToday: number;
  cancelledToday: number;
}
