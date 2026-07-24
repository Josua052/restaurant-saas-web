export interface ApiOrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  quantity: number;
  notes?: string;
  ticket_status: number; // 1 = pending, 4 = served
}

export interface ApiOrder {
  id: string;
  receipt_number: string;
  queue_number?: string;
  order_type: "Dine-in" | "Takeaway" | "Delivery";
  table_id?: string;
  customer_name?: string;
  fulfillment_status: number; // 1 = Preparing, 2 = Ready, 3 = Completed
  created_at: string;
  order_items: ApiOrderItem[];
}

export interface MenuItem {
  ID: string;
  Name: string;
}

export interface TableItem {
  id: string;
  table_number: string;
}

// Derived type for UI
export interface KitchenOrder extends Omit<ApiOrder, "order_items" | "table_id"> {
  table_number?: string;
  items: (ApiOrderItem & { name: string })[];
}



export interface KitchenStats {
  newOrders: number;
  preparing: number;
  completedToday: number;
  cancelledToday: number;
}
