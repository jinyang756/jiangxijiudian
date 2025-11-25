export interface MenuItem {
  id: string;
  zh: string;
  en: string;
  price: number;
  spicy?: boolean;
  vegetarian?: boolean;
  available?: boolean;
  imageUrl?: string;
}

export interface MenuCategory {
  key: string;
  titleZh: string;
  titleEn: string;
  items: MenuItem[];
}

export interface CartItems {
  [itemId: string]: number;
}

// API Interfaces
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface SubmitOrderPayload {
  tableId: string;
  items: {
    dishId: string;
    quantity: number;
  }[];
  totalAmount: number;
  remark?: string;
}

export interface ServiceRequestPayload {
  tableId: string;
  type: string;
  typeName: string;
  details?: string;
}