import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getVisibleBankQRs } from "../../services/bankQR";
import { generatePaymentQR } from "../../services/payment";
import { getWallet, getMyTransactions } from "../../services/wallet";
import "./qr-payment.scss";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const buildVietQrImageUrl = ({ bin, accountNo, accountName, amount, content }) => {
  if (!bin || !accountNo) return "";

  const params = new URLSearchParams();
  if (amount && Number(amount) > 0) params.set("amount", String(Math.floor(Number(amount))));
  if (content) params.set("addInfo", content);
  if (accountName) params.set("accountName", accountName);

  return `https://img.vietqr.io/image/${encodeURIComponent(bin)}-${encodeURIComponent(accountNo)}-compact2.png?${params.toString()}`;
};

const getLatestPaymentQR = (transactions, visibleBanks) => {
  const latestTransaction = transactions.find(
    (tx) => tx.method === "bank_transfer" && tx.status === "pending" && tx.referenceCode
  );

  if (!latestTransaction) return null;

  const bankInfo = visibleBanks.find((item) => item.code === latestTransaction.bank);
  if (!bankInfo?.bin || !bankInfo?.accountNo) return null;

  const referenceCode = latestTransaction.referenceCode;

  return {
    imageUrl: buildVietQrImageUrl({
      bin: bankInfo.bin,
      accountNo: bankInfo.accountNo,
      accountName: bankInfo.accountName,
      amount: latestTransaction.amount,
      content: referenceCode,
    }),
    accountName: bankInfo.accountName || "",
    accountNo: bankInfo.accountNo || "",
    bank: bankInfo.code,
    amount: latestTransaction.amount,
    content: referenceCode,
    referenceCode,
    transactionId: latestTransaction._id,
    status: latestTransaction.status,
    isLatest: true,
  };
};

const QRPayment = () => {
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("vietin");
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState("");
  const [autoConfirmed, setAutoConfirmed] = useState(false);
  const [error, setError] = useState("");

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  const fmtMoney = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(value || 0));

  const refreshWalletAndTransactions = useCallback(async () => {
    if (!userInfo) return [];

    const [walletResult, transactionsResult] = await Promise.allSettled([
      getWallet(),
      getMyTransactions(),
    ]);

    if (walletResult.status === "fulfilled") {
      setWallet(walletResult.value?.data?.wallet || walletResult.value?.data);
    }

    if (transactionsResult.status === "fulfilled") {
      return transactionsResult.value?.data || [];
    }

    return [];
  }, [userInfo]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [bankResult, transactionsResult] = await Promise.allSettled([
          getVisibleBankQRs(),
          refreshWalletAndTransactions(),
        ]);

        if (bankResult.status === "fulfilled") {
          const visibleBanks = bankResult.value?.data || [];
          setBanks(visibleBanks);
          if (visibleBanks.length > 0 && !visibleBanks.some((item) => item.code === bank)) {
            setBank(visibleBanks[0].code);
          }

          const transactions =
            transactionsResult.status === "fulfilled" ? transactionsResult.value : [];
          setQrData((current) => current || getLatestPaymentQR(transactions, visibleBanks));
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [bank, refreshWalletAndTransactions]);

  useEffect(() => {
    if (!qrData?.transactionId || autoConfirmed) return undefined;

    const interval = setInterval(async () => {
      try {
        const transactions = await refreshWalletAndTransactions();
        const matched = transactions.find((tx) => tx._id === qrData.transactionId);
        if (matched?.status === "success") {
          setAutoConfirmed(true);
          setQrData((current) => current && { ...current, status: "success" });
        }
      } catch {
        /* Keep polling quietly. */
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [qrData?.transactionId, autoConfirmed, refreshWalletAndTransactions]);

  const copyText = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    });
  };

  const handleCreateQR = async (event) => {
    event.preventDefault();

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue < 1000) {
      setError("Vui lòng nhập số tiền nạp từ 1.000 VND trở lên.");
      return;
    }

    setCreating(true);
    setError("");
    setAutoConfirmed(false);

    try {
      const response = await generatePaymentQR(amountValue, bank);
      setQrData(response.data);
      await refreshWalletAndTransactions();
    } catch (err) {
      setQrData(null);
      setError(
        err?.response?.data?.message ||
          "Không tạo được QR nạp tiền. Vui lòng thử lại."
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="qp-page">
        <div className="qp-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="qp-page">
      <div className="qp-container qp-container--wide">
        <div className="qp-title-row">
          <div>
            <h1>Nạp tiền vào ví</h1>
            <p className="qp-subtitle">
              Tạo mã VietQR theo số tiền cần nạp. Hệ thống sẽ tự xác nhận khi
              webhook ngân hàng khớp số tiền và nội dung chuyển khoản.
            </p>
          </div>
          {wallet && (
            <div className="qp-balance">
              Số dư <strong>{fmtMoney(wallet.balance)}</strong>
            </div>
          )}
        </div>

        <div className="qp-classic-grid">
          <section className="qp-step-content">
            <h2 className="qp-section-title">Tạo QR nạp tiền</h2>
            <form className="qp-form" onSubmit={handleCreateQR}>
              <label>
                <span>Số tiền nạp</span>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Nhập số tiền VND"
                />
              </label>

              <div className="qp-quick-amounts">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={Number(amount) === value ? "active" : ""}
                    onClick={() => setAmount(String(value))}
                  >
                    {fmtMoney(value)}
                  </button>
                ))}
              </div>

              <label>
                <span>Ngân hàng nhận</span>
                <select value={bank} onChange={(event) => setBank(event.target.value)}>
                  {banks.length > 0 ? (
                    banks.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option value="vietin">VietinBank</option>
                  )}
                </select>
              </label>

              {error && <div className="qp-error">{error}</div>}

              <button className="qp-btn primary qp-submit" type="submit" disabled={creating}>
                {creating ? "Đang tạo QR..." : "Tạo QR thanh toán"}
              </button>
            </form>
          </section>

          <section className="qp-step-content">
            <h2 className="qp-section-title">Thông tin chuyển khoản</h2>
            {!qrData ? (
              <div className="qp-empty">
                Nhập số tiền rồi tạo QR. Sau khi chuyển khoản, giao dịch pending
                sẽ được tự động xác nhận qua webhook hoặc xác nhận thủ công bởi admin.
              </div>
            ) : (
              <div className="qp-transfer-layout">
                <div className={qrData.isLatest ? "qp-qr-display has-badge" : "qp-qr-display"}>
                  {qrData.imageUrl ? (
                    <>
                      {qrData.isLatest && <div className="qp-qr-badge">QR thanh toán mới nhất</div>}
                      <img src={qrData.imageUrl} alt="VietQR nạp tiền" />
                    </>
                  ) : (
                    <div className="qp-qr-missing">Không có ảnh QR</div>
                  )}
                </div>

                <div className="qp-transfer-info">
                  <div className="qp-info-title">
                    {autoConfirmed ? "Đã xác nhận thành công" : "Đang chờ chuyển khoản"}
                  </div>
                  {[
                    { label: "Số tiền", value: fmtMoney(qrData.amount), key: "amount" },
                    { label: "Nội dung CK", value: qrData.referenceCode || qrData.content, key: "content" },
                    { label: "Ngân hàng", value: qrData.bank, key: "bank" },
                    { label: "Số tài khoản", value: qrData.accountNo, key: "account" },
                    { label: "Chủ tài khoản", value: qrData.accountName, key: "name" },
                  ].map(({ label, value, key }) => (
                    <div key={key} className="qp-info-row">
                      <span className="qp-info-label">{label}</span>
                      <span className="qp-info-value">
                        {value}
                        {["content", "account"].includes(key) && (
                          <button
                            className="qp-copy-btn"
                            type="button"
                            onClick={() => copyText(value, key)}
                          >
                            {copied === key ? "OK" : "Copy"}
                          </button>
                        )}
                      </span>
                    </div>
                  ))}

                  {autoConfirmed && (
                    <div className="qp-success-inline">
                      Ví đã được cộng tiền. Bạn có thể kiểm tra chi tiết ở lịch sử thanh toán.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;
