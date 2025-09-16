import { TransactionCategory, PaymentMethod, CategoryInfo, PaymentMethodInfo } from '../types/Transaction';

export const CATEGORY_INFO: Record<TransactionCategory, CategoryInfo> = {
  // Income categories
  'luong-chinh': { name: 'Lương chính', icon: '💼', color: 'bg-green-100 text-green-800' },
  'thu-nhap-phu': { name: 'Thu nhập phụ', icon: '💡', color: 'bg-green-100 text-green-800' },
  'kinh-doanh': { name: 'Kinh doanh', icon: '🏪', color: 'bg-green-100 text-green-800' },
  'dau-tu': { name: 'Đầu tư', icon: '📈', color: 'bg-green-100 text-green-800' },
  'tien-thuong': { name: 'Tiền thưởng', icon: '🎁', color: 'bg-green-100 text-green-800' },
  'tien-cho': { name: 'Tiền cho', icon: '🤝', color: 'bg-green-100 text-green-800' },
  
  // Expense categories
  'an-uong-duong-pho': { name: 'Ăn uống đường phố', icon: '🍜', color: 'bg-red-100 text-red-800' },
  'chi-phi-xe-may': { name: 'Chi phí xe máy', icon: '🛵', color: 'bg-blue-100 text-blue-800' },
  'gui-tien-gia-dinh': { name: 'Gửi tiền gia đình', icon: '👨‍👩‍👧‍👦', color: 'bg-purple-100 text-purple-800' },
  'hoc-phi': { name: 'Học phí', icon: '📚', color: 'bg-indigo-100 text-indigo-800' },
  'y-te': { name: 'Y tế', icon: '🏥', color: 'bg-pink-100 text-pink-800' },
  'mua-sam': { name: 'Mua sắm', icon: '🛍️', color: 'bg-orange-100 text-orange-800' },
  'giai-tri': { name: 'Giải trí', icon: '🎉', color: 'bg-cyan-100 text-cyan-800' },
  'hoa-don-sinh-hoat': { name: 'Hóa đơn sinh hoạt', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  'tien-nha': { name: 'Tiền nhà', icon: '🏠', color: 'bg-gray-100 text-gray-800' },
  'bao-hiem': { name: 'Bảo hiểm', icon: '🛡️', color: 'bg-teal-100 text-teal-800' },
  'tien-le-tet': { name: 'Tiết kiệm/Lễ Tết', icon: '🧧', color: 'bg-red-100 text-red-800' },
};

export const PAYMENT_METHOD_INFO: Record<PaymentMethod, PaymentMethodInfo> = {
  'tien-mat': { name: 'Tiền mặt', icon: '💵', color: 'bg-green-100 text-green-800' },
  'chuyen-khoan': { name: 'Chuyển khoản', icon: '🏦', color: 'bg-blue-100 text-blue-800' },
  'momo': { name: 'MoMo', icon: '📱', color: 'bg-pink-100 text-pink-800' },
  'zalopay': { name: 'ZaloPay', icon: '💙', color: 'bg-blue-100 text-blue-800' },
  'viettel-money': { name: 'Viettel Money', icon: '📲', color: 'bg-red-100 text-red-800' },
  'shopee-pay': { name: 'ShopeePay', icon: '🛒', color: 'bg-orange-100 text-orange-800' },
  'the-tin-dung': { name: 'Thẻ tín dụng', icon: '💳', color: 'bg-purple-100 text-purple-800' },
  'the-ghi-no': { name: 'Thẻ ghi nợ', icon: '💳', color: 'bg-gray-100 text-gray-800' },
};

export const VIETNAMESE_MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export const VIETNAMESE_DAYS = [
  'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'
];