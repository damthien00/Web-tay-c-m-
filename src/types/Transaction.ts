export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: TransactionCategory;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  location?: string;
  tags?: string[];
}

export type TransactionCategory = 
  // Income categories
  | 'luong-chinh'
  | 'thu-nhap-phu'
  | 'kinh-doanh'
  | 'dau-tu'
  | 'tien-thuong'
  | 'tien-cho'
  // Expense categories
  | 'an-uong-duong-pho'
  | 'chi-phi-xe-may'
  | 'gui-tien-gia-dinh'
  | 'hoc-phi'
  | 'y-te'
  | 'mua-sam'
  | 'giai-tri'
  | 'hoa-don-sinh-hoat'
  | 'tien-nha'
  | 'bao-hiem'
  | 'tien-le-tet';

export type PaymentMethod = 
  | 'tien-mat'
  | 'chuyen-khoan'
  | 'momo'
  | 'zalopay'
  | 'viettel-money'
  | 'shopee-pay'
  | 'the-tin-dung'
  | 'the-ghi-no';

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export interface PaymentMethodInfo {
  name: string;
  icon: string;
  color: string;
}