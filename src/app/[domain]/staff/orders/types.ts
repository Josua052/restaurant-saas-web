export interface MenuCategory {
  ID: string;
  Name: string;
  Description: string;
}

export interface MenuItem {
  ID: string;
  Name: string;
  Description: string;
  Price: number;
  ImageURL: string;
  IsAvailable: boolean;
  CategoryID: string;
}

export interface TableSection {
  id: string;
  name: string;
}

export interface TableResponseDTO {
  id: string;
  table_number: string;
  capacity: number;
  status: number;
  section_id: string;
  section?: TableSection;
  active_res?: { guest_name: string; time: string };
}

export interface CartItem {
  cart_id: string;
  menu_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  note: string;
}

export interface CompletedSession {
  receiptNumber: string;
  queueNumber?: string;
  orderType: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  taxRatePercent: number;
  total: number;
  paymentMethod?: string;
  cashReceived?: number;
  change?: number;
  createdAt: string;
}
