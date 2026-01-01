import api from "./apiService";

/**
 * Tạo QR code thanh toán với nội dung tự động từ file JSON
 * Backend sẽ tự động tìm nội dung trong file JSON dựa trên số tiền
 * 
 * @param {number} amount - Số tiền (VND) - BẮT BUỘC
 * @param {string} bank - Ngân hàng: 'mb' (mặc định), 'hdbank', etc.
 * @returns {Promise} Response từ API với imageUrl và thông tin QR code
 */
export const generatePaymentQR = (amount, bank = "mb") => {
  const params = new URLSearchParams();
  params.append("amount", amount);
  if (bank) {
    params.append("bank", bank);
  }

  return api.get(`/payments/qr?${params.toString()}`);
};

const paymentService = {
  generatePaymentQR,
};

export default paymentService;

