/**
 * QR Code Debug Helper
 * Tool để debug và kiểm tra thông tin QR code từ backend
 */

/**
 * Parse QR code URL để lấy thông tin tài khoản
 * @param {string} qrUrl - URL của QR code image
 * @returns {Object} Thông tin tài khoản từ URL
 */
export const parseQRUrl = (qrUrl) => {
  if (!qrUrl) return null;

  try {
    const url = new URL(qrUrl);
    const params = new URLSearchParams(url.search);
    
    return {
      accountName: params.get('accountName') ? decodeURIComponent(params.get('accountName')) : null,
      accountNo: params.get('accountNo') || null,
      amount: params.get('amount') || null,
      addInfo: params.get('addInfo') || null,
      bin: url.pathname.split('/').find(part => part && !part.includes('.')) || null,
      fullUrl: qrUrl
    };
  } catch (error) {
    console.error('Error parsing QR URL:', error);
    return null;
  }
};

/**
 * Kiểm tra thông tin tài khoản có đúng không
 * @param {Object} accountInfo - Thông tin tài khoản từ API
 * @param {string} qrUrl - URL của QR code
 * @returns {Object} Kết quả validation
 */
export const validateAccountInfo = (accountInfo, qrUrl = null) => {
  const EXPECTED = {
    accountName: 'TRAN DANG LINH',
    accountNo: '77891011121314',
    bin: '970422'
  };

  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    accountInfo: {
      name: accountInfo?.accountName || null,
      no: accountInfo?.accountNo || null,
      fromUrl: null
    },
    qrUrlInfo: null
  };

  // Parse QR URL nếu có
  if (qrUrl) {
    result.qrUrlInfo = parseQRUrl(qrUrl);
    if (result.qrUrlInfo?.accountName) {
      result.accountInfo.fromUrl = result.qrUrlInfo.accountName;
    }
  }

  // Kiểm tra tên tài khoản
  const accountName = accountInfo?.accountName || result.accountInfo.fromUrl;
  if (accountName) {
    if (accountName.toUpperCase() !== EXPECTED.accountName.toUpperCase()) {
      result.isValid = false;
      result.errors.push({
        field: 'accountName',
        expected: EXPECTED.accountName,
        actual: accountName,
        message: `Tên tài khoản sai! Mong đợi: "${EXPECTED.accountName}", Nhận được: "${accountName}"`
      });
    }
  } else {
    result.warnings.push({
      field: 'accountName',
      message: 'Không tìm thấy tên tài khoản trong response'
    });
  }

  // Kiểm tra số tài khoản
  const accountNo = accountInfo?.accountNo || result.qrUrlInfo?.accountNo;
  if (accountNo) {
    if (accountNo !== EXPECTED.accountNo) {
      result.isValid = false;
      result.errors.push({
        field: 'accountNo',
        expected: EXPECTED.accountNo,
        actual: accountNo,
        message: `Số tài khoản sai! Mong đợi: "${EXPECTED.accountNo}", Nhận được: "${accountNo}"`
      });
    }
  } else {
    result.warnings.push({
      field: 'accountNo',
      message: 'Không tìm thấy số tài khoản trong response'
    });
  }

  return result;
};

/**
 * Log chi tiết thông tin debug
 * @param {Object} apiResponse - Response từ API /payments/qr
 * @param {Object} accountInfo - Thông tin từ API /payments/sepay/account-info
 */
export const debugQRCode = (apiResponse, accountInfo = null) => {
  console.group('🔍 QR CODE DEBUG REPORT');
  
  console.log('📡 API Response:', apiResponse);
  console.log('👤 Account Info:', accountInfo);
  
  if (apiResponse?.imageUrl) {
    const qrUrlInfo = parseQRUrl(apiResponse.imageUrl);
    console.log('🔗 QR URL Parsed:', qrUrlInfo);
    
    if (qrUrlInfo?.accountName) {
      console.log('📝 Account Name from QR URL:', qrUrlInfo.accountName);
    }
  }

  const validation = validateAccountInfo(apiResponse, apiResponse?.imageUrl);
  
  if (validation.isValid) {
    console.log('✅ Thông tin tài khoản ĐÚNG');
  } else {
    console.error('❌ Thông tin tài khoản SAI:');
    validation.errors.forEach(error => {
      console.error(`  - ${error.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Cảnh báo:');
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning.message}`);
    });
  }

  console.groupEnd();

  return validation;
};

/**
 * Tạo QR URL đúng với thông tin tài khoản chính xác
 * @param {Object} params - Tham số để tạo QR
 * @returns {string} QR URL đúng
 */
export const generateCorrectQRUrl = (params) => {
  const {
    amount,
    content,
    accountNo = '77891011121314',
    accountName = 'TRAN DANG LINH',
    bin = '970422'
  } = params;

  const baseUrl = `https://img.vietqr.io/image/${bin}-${accountNo}-compact2.png`;
  const urlParams = new URLSearchParams({
    amount: amount?.toString() || '',
    addInfo: content || '',
    accountName: accountName
  });

  return `${baseUrl}?${urlParams.toString()}`;
};

export default {
  parseQRUrl,
  validateAccountInfo,
  debugQRCode,
  generateCorrectQRUrl
};

