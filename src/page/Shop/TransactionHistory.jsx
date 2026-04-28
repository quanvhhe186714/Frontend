import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTransactions, getWallet } from "../../services/wallet";
import "./transaction-history.scss";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "topup", label: "⬆️ Nạp tiền" },
  { key: "spend", label: "⬇️ Chi tiêu" },
  { key: "pending", label: "⏳ Chờ duyệt" },
];

const PAGE_SIZE = 10;

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [wallet, setWallet] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const [txRes, walletRes] = await Promise.allSettled([getMyTransactions(), getWallet()]);
      if (txRes.status === "fulfilled") setTransactions(txRes.value.data || []);
      else setError("Không thể tải lịch sử. Vui lòng đăng nhập.");
      if (walletRes.status === "fulfilled") {
        const wr = walletRes.value;
        setWallet(wr?.data?.wallet || wr?.data);
      }
    } finally { setLoading(false); }
  };

  const filtered = transactions.filter(tx => {
    const matchTab =
      activeTab === "all" ||
      (activeTab === "topup" && tx.amount > 0 && tx.status === "success") ||
      (activeTab === "spend" && tx.amount < 0) ||
      (activeTab === "pending" && tx.status === "pending");
    const q = search.toLowerCase();
    const matchSearch = !q || (tx.note || "").toLowerCase().includes(q) || (tx.referenceCode || "").toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalIn = transactions.filter(t => t.status === "success" && t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  const fmtDate = d => new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusLabel = { success: "Thành công", pending: "Chờ duyệt", failed: "Thất bại" };

  if (loading) return <div className="th-page"><div className="th-loading">Đang tải...</div></div>;

  return (
    <div className="th-page">
      <div className="th-container">
        {/* Header */}
        <div className="th-header">
          <h1>📊 Lịch sử giao dịch</h1>
          <button className="th-refresh" onClick={fetchData}>↻ Làm mới</button>
        </div>

        {error && <div className="th-error">{error} <button onClick={() => navigate("/login")}>Đăng nhập</button></div>}

        {/* Summary cards */}
        <div className="th-summary">
          {wallet && (
            <div className="th-summary-card wallet">
              <div className="th-sum-label">💰 Số dư ví</div>
              <div className="th-sum-amount">{fmt(wallet.balance)}</div>
              <div className="th-sum-sub">{wallet.currency || "VND"}</div>
            </div>
          )}
          <div className="th-summary-card income">
            <div className="th-sum-label">⬆️ Tổng nạp</div>
            <div className="th-sum-amount">{fmt(totalIn)}</div>
            <div className="th-sum-sub">{transactions.filter(t => t.status === "success" && t.amount > 0).length} giao dịch</div>
          </div>
          {totalOut !== 0 && (
            <div className="th-summary-card expense">
              <div className="th-sum-label">⬇️ Đã dùng</div>
              <div className="th-sum-amount">{fmt(Math.abs(totalOut))}</div>
              <div className="th-sum-sub">{transactions.filter(t => t.amount < 0).length} giao dịch</div>
            </div>
          )}
          {totalPending > 0 && (
            <div className="th-summary-card pending">
              <div className="th-sum-label">⏳ Chờ xác nhận</div>
              <div className="th-sum-amount">{fmt(totalPending)}</div>
              <div className="th-sum-sub">{transactions.filter(t => t.status === "pending").length} giao dịch</div>
            </div>
          )}
        </div>

        {/* Tabs + Search */}
        <div className="th-toolbar">
          <div className="th-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`th-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => { setActiveTab(t.key); setPage(1); }}>{t.label}</button>
            ))}
          </div>
          <input className="th-search" placeholder="🔍 Tìm nội dung, mã GD..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Table */}
        {paginated.length === 0 ? (
          <div className="th-empty">Không có giao dịch nào. <button onClick={() => navigate("/qr-payment")}>Nạp tiền ngay →</button></div>
        ) : (
          <>
            <div className="th-table-wrap">
              <table className="th-table">
                <thead>
                  <tr><th>Thời gian</th><th>Loại</th><th>Số tiền</th><th>Nội dung</th><th>Trạng thái</th></tr>
                </thead>
                <tbody>
                  {paginated.map(tx => (
                    <tr key={tx._id} className="th-row" onClick={() => setSelectedTx(tx)}>
                      <td className="th-date">{fmtDate(tx.createdAt)}</td>
                      <td><span className="th-type">{tx.amount >= 0 ? "⬆️ Nạp" : "⬇️ Chi"}</span></td>
                      <td className={`th-amount ${tx.amount >= 0 ? "pos" : "neg"}`}>
                        {tx.amount >= 0 ? "+" : ""}{fmt(tx.amount)}
                      </td>
                      <td className="th-note">{tx.note || tx.referenceCode || "---"}</td>
                      <td><span className={`th-status ${tx.status}`}>{statusLabel[tx.status] || tx.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="th-pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
              <span>Trang {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Tiếp →</button>
            </div>
          </>
        )}

        {/* Detail modal */}
        {selectedTx && (
          <div className="th-modal-overlay" onClick={() => setSelectedTx(null)}>
            <div className="th-modal" onClick={e => e.stopPropagation()}>
              <div className="th-modal-header">
                <h3>Chi tiết giao dịch</h3>
                <button onClick={() => setSelectedTx(null)}>✕</button>
              </div>
              {[
                ["Thời gian", fmtDate(selectedTx.createdAt)],
                ["Số tiền", fmt(selectedTx.amount)],
                ["Phương thức", selectedTx.method || "---"],
                ["Ngân hàng", selectedTx.bank || "---"],
                ["Mã tham chiếu", selectedTx.referenceCode || "---"],
                ["Nội dung", selectedTx.note || "---"],
                ["Trạng thái", statusLabel[selectedTx.status] || selectedTx.status],
              ].map(([k, v]) => (
                <div key={k} className="th-modal-row">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
