import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCustomQRs } from "../../services/customQR";
import { getWallet, getMyTransactions, createTopupRequest } from "../../services/wallet";
import "./qr-payment.scss";

const STEPS = ["Chọn ngân hàng", "Quét mã QR", "Xác nhận"];

const QRPayment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [qrList, setQrList] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState("");

  const userInfo = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("userInfo")); } catch { return null; }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const r = await getPublishedCustomQRs();
        setQrList(r?.data || []);
      } catch {}
      if (userInfo) {
        try { const wr = await getWallet(); setWallet(wr?.data?.wallet || wr?.data); } catch {}
        try {
          const t = (await getMyTransactions()).data || [];
          setRecentTxs(t.slice(0, 5));
        } catch {}
      }
      setLoading(false);
    };
    init();
  }, [userInfo]);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const autoContent = userInfo ? `NAP ${userInfo.name?.split(" ").pop() || userInfo.email?.split("@")[0] || "USER"}`.toUpperCase() : "NAP TIEN";

  const handleConfirm = async () => {
    if (!selectedQR) return;
    setSubmitting(true);
    try {
      await createTopupRequest(selectedQR.amount || 0, "bank_transfer", selectedQR.bank || "vietin", autoContent);
      setSuccess(true);
      setTimeout(() => navigate("/transaction-history"), 2500);
    } catch (e) {
      alert(e?.response?.data?.message || "Lỗi tạo yêu cầu. Thử lại.");
    } finally { setSubmitting(false); }
  };

  const fmtBalance = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  const fmtDate = d => new Date(d).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });

  if (loading) return <div className="qp-page"><div className="qp-loading">Đang tải...</div></div>;

  return (
    <div className="qp-page">
      <div className="qp-container">
        <div className="qp-title-row">
          <h1>💳 Nạp tiền vào ví</h1>
          {userInfo && wallet && (
            <div className="qp-balance">Số dư: <strong>{fmtBalance(wallet.balance)}</strong></div>
          )}
          {!userInfo && (
            <button className="qp-login-btn" onClick={() => navigate("/login")}>Đăng nhập để xem số dư</button>
          )}
        </div>

        {/* Step indicator */}
        <div className="qp-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`qp-step ${i === step ? "active" : i < step ? "done" : ""}`}>
              <div className="qp-step-circle">{i < step ? "✓" : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="qp-step-line" />}
            </div>
          ))}
        </div>

        {/* STEP 0: Chọn ngân hàng/QR */}
        {step === 0 && (
          <div className="qp-step-content">
            <h2 className="qp-section-title">Chọn phương thức thanh toán</h2>
            {qrList.length === 0 ? (
              <div className="qp-empty">Chưa có QR thanh toán. Liên hệ Admin để được hỗ trợ.</div>
            ) : (
              <div className="qp-qr-grid">
                {qrList.map(qr => (
                  <div key={qr._id} className={`qp-qr-card ${selectedQR?._id === qr._id ? "active" : ""}`} onClick={() => setSelectedQR(qr)}>
                    <div className="qp-qr-bank">{(qr.bank || "BANK").toUpperCase()}</div>
                    {qr.imageUrl && <img src={qr.imageUrl} alt={qr.name} className="qp-qr-thumb" />}
                    <div className="qp-qr-name">{qr.name}</div>
                    {qr.amount > 0 && <div className="qp-qr-amount">{fmtBalance(qr.amount)}</div>}
                  </div>
                ))}
              </div>
            )}
            <div className="qp-nav">
              <div />
              <button className="qp-btn primary" disabled={!selectedQR} onClick={() => setStep(1)}>Tiếp theo →</button>
            </div>
          </div>
        )}

        {/* STEP 1: Quét QR */}
        {step === 1 && selectedQR && (
          <div className="qp-step-content">
            <h2 className="qp-section-title">Quét mã QR chuyển khoản</h2>
            <div className="qp-transfer-layout">
              <div className="qp-qr-display">
                {selectedQR.imageUrl
                  ? <img src={selectedQR.imageUrl} alt="QR" />
                  : <div className="qp-qr-placeholder">📷 QR Code</div>
                }
              </div>
              <div className="qp-transfer-info">
                <div className="qp-info-title">Thông tin chuyển khoản</div>
                {[
                  { label: "Ngân hàng", value: (selectedQR.bank || "").toUpperCase(), key: "bank" },
                  { label: "Số tài khoản", value: selectedQR.accountNo || "---", key: "stk" },
                  { label: "Tên tài khoản", value: selectedQR.accountName || "---", key: "name" },
                  { label: "Nội dung CK", value: selectedQR.content || autoContent, key: "content" },
                  { label: "Số tiền", value: selectedQR.amount > 0 ? fmtBalance(selectedQR.amount) : "Tùy ý", key: "amount" },
                ].map(({ label, value, key }) => (
                  <div key={key} className="qp-info-row">
                    <span className="qp-info-label">{label}</span>
                    <span className="qp-info-value">
                      {value}
                      {(key === "stk" || key === "content") && (
                        <button className="qp-copy-btn" onClick={() => copyText(value, key)}>
                          {copied === key ? "✓" : "📋"}
                        </button>
                      )}
                    </span>
                  </div>
                ))}
                <div className="qp-note">
                  <strong>⚠️ Lưu ý:</strong> Nhập đúng nội dung chuyển khoản để admin xác nhận nhanh hơn.
                </div>
              </div>
            </div>
            <div className="qp-nav">
              <button className="qp-btn secondary" onClick={() => setStep(0)}>← Quay lại</button>
              <button className="qp-btn primary" onClick={() => setStep(2)}>Tôi đã chuyển →</button>
            </div>
          </div>
        )}

        {/* STEP 2: Xác nhận */}
        {step === 2 && (
          <div className="qp-step-content">
            <h2 className="qp-section-title">Xác nhận thanh toán</h2>
            {success ? (
              <div className="qp-success">
                <div className="qp-success-icon">✅</div>
                <h3>Yêu cầu nạp tiền đã gửi!</h3>
                <p>Admin sẽ xác nhận trong vòng 1-5 phút. Đang chuyển đến lịch sử giao dịch...</p>
              </div>
            ) : (
              <>
                <div className="qp-confirm-box">
                  <p>Bạn xác nhận đã chuyển khoản thành công?</p>
                  <ul>
                    <li>✅ Đã mở app ngân hàng và quét mã QR</li>
                    <li>✅ Đã nhập đúng nội dung: <strong>{selectedQR?.content || autoContent}</strong></li>
                    <li>✅ Đã chụp màn hình biên lai để làm bằng chứng</li>
                  </ul>
                  {!userInfo && <p className="qp-warn">⚠️ Bạn cần đăng nhập để tạo yêu cầu nạp tiền.</p>}
                </div>
                <div className="qp-nav">
                  <button className="qp-btn secondary" onClick={() => setStep(1)}>← Quay lại</button>
                  {userInfo ? (
                    <button className="qp-btn primary" onClick={handleConfirm} disabled={submitting}>
                      {submitting ? "Đang xử lý..." : "✓ Xác nhận đã chuyển khoản"}
                    </button>
                  ) : (
                    <button className="qp-btn primary" onClick={() => navigate("/login")}>Đăng nhập để xác nhận</button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Mini lịch sử */}
        {userInfo && recentTxs.length > 0 && (
          <div className="qp-recent">
            <div className="qp-recent-title">Lần nạp gần nhất</div>
            {recentTxs.map(tx => (
              <div key={tx._id} className="qp-recent-row">
                <span className="qp-recent-date">{fmtDate(tx.createdAt)}</span>
                <span className="qp-recent-note">{tx.note || tx.referenceCode || "---"}</span>
                <span className={`qp-recent-amount ${tx.amount > 0 ? "pos" : "neg"}`}>
                  {tx.amount > 0 ? "+" : ""}{fmtBalance(tx.amount)}
                </span>
                <span className={`qp-recent-status ${tx.status}`}>{tx.status === "success" ? "✓" : tx.status === "pending" ? "⏳" : "✗"}</span>
              </div>
            ))}
            <button className="qp-view-all" onClick={() => navigate("/transaction-history")}>Xem tất cả lịch sử →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPayment;
