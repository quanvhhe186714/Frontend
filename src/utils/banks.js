// Danh sách 20 ngân hàng phổ biến + thông tin tài khoản của BẠN.
// Thay số tài khoản/tên theo thực tế trước khi build (hoặc inject qua môi trường).

export const BANKS = [
  { code: 'vietin',   name: 'VietinBank',    bin: '970415', accountNo: '107876717017', accountName: 'VU HONG QUAN' },
  { code: 'hdbank',  name: 'HDBank',        bin: '970437', accountNo: '082704070007936', accountName: 'LE VAN HA' },
  { code: 'vcb',     name: 'Vietcombank',   bin: '970436', accountNo: '', accountName: '' },
  { code: 'bidv',    name: 'BIDV (HONG CON BINH)', bin: '970418', accountNo: '8835915459', accountName: 'HONG CON BINH', qrImage: '/qr/BIDV.jpg' },
  { code: 'bidv_hieu', name: 'BIDV (VO MINH HIEU)', bin: '970418', accountNo: '8871752191', accountName: 'VO MINH HIEU', qrImage: '/qr/BIDVHIEU.jpg' },
  { code: 'agribank',name: 'Agribank',      bin: '970405', accountNo: '', accountName: '' },
  { code: 'techcom', name: 'Techcombank',   bin: '970407', accountNo: '', accountName: '' },
  { code: 'acb',     name: 'ACB',           bin: '970416', accountNo: '', accountName: '' },
  { code: 'sacombank',name:'Sacombank',     bin: '970403', accountNo: '', accountName: '' },
  { code: 'vpbank',  name: 'VPBank',        bin: '970432', accountNo: '', accountName: '' },
  { code: 'shb',     name: 'SHB',           bin: '970443', accountNo: '', accountName: '' },
  { code: 'tpbank',  name: 'TPBank',        bin: '970423', accountNo: '', accountName: '' },
  { code: 'scb',     name: 'SCB',           bin: '970429', accountNo: '', accountName: '' },
  { code: 'vib',     name: 'VIB',           bin: '970441', accountNo: '', accountName: '' },
  { code: 'eximbank',name: 'Eximbank',      bin: '970431', accountNo: '', accountName: '' },
  { code: 'ocb',     name: 'OCB (NGUYEN DOAN LUAN)', bin: '970448', accountNo: '591635', accountName: 'NGUYEN DOAN LUAN', qrImage: '/qr/OCB.jpg' },
  { code: 'ocb_ca',  name: 'OCB (NGO VAN CA)', bin: '970448', accountNo: '0072100010', accountName: 'NGO VAN CA', qrImage: '/qr/OCBCA.jpg' },
  { code: 'abbank',  name: 'ABBANK',        bin: '970425', accountNo: '', accountName: '' },
  { code: 'seabank', name: 'SeABank',       bin: '970440', accountNo: '', accountName: '' },
  { code: 'msb',     name: 'MSB',           bin: '970426', accountNo: '', accountName: '' },
  { code: 'namabank',name: 'Nam A Bank',    bin: '970428', accountNo: '', accountName: '' },
];

export const BANK_MAP = BANKS.reduce((m,b)=>{m[b.code]=b;return m;},{});

export const buildVietQrUrl = ({ bin, accountNo, accountName, amount, content }) => {
  const base = `https://img.vietqr.io/image/${encodeURIComponent(bin)}-${encodeURIComponent(accountNo)}-compact2.png`;
  const params = new URLSearchParams();
  if (amount && Number(amount) > 0) params.set('amount', Math.floor(Number(amount)));
  if (content) params.set('addInfo', content);
  if (accountName) params.set('accountName', accountName);
  return `${base}?${params.toString()}`;
};
