/** Bank codes for admin/internal use only — no account numbers on public UI. */
export const BANKS = [
  { code: "vietin", name: "VietinBank", bin: "970415" },
  { code: "hdbank", name: "HDBank", bin: "970437" },
  { code: "vcb", name: "Vietcombank", bin: "970436" },
  { code: "bidv", name: "BIDV", bin: "970418" },
  { code: "bidv_hieu", name: "BIDV", bin: "970418" },
  { code: "agribank", name: "Agribank", bin: "970405" },
  { code: "techcom", name: "Techcombank", bin: "970407" },
  { code: "acb", name: "ACB", bin: "970416" },
  { code: "sacombank", name: "Sacombank", bin: "970403" },
  { code: "vpbank", name: "VPBank", bin: "970432" },
  { code: "shb", name: "SHB", bin: "970443" },
  { code: "tpbank", name: "TPBank", bin: "970423" },
  { code: "scb", name: "SCB", bin: "970429" },
  { code: "vib", name: "VIB", bin: "970441" },
  { code: "eximbank", name: "Eximbank", bin: "970431" },
  { code: "ocb", name: "OCB", bin: "970448" },
  { code: "ocb_ca", name: "OCB", bin: "970448" },
  { code: "abbank", name: "ABBANK", bin: "970425" },
  { code: "seabank", name: "SeABank", bin: "970440" },
  { code: "msb", name: "MSB", bin: "970426" },
  { code: "namabank", name: "Nam A Bank", bin: "970428" },
];

export const BANK_MAP = BANKS.reduce((m, b) => {
  m[b.code] = b;
  return m;
}, {});
