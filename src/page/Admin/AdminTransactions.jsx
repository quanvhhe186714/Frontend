import React, { useEffect, useState } from "react";
import walletService from "../../services/wallet";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  // ---------------- HANDLERS ----------------
  const handleSoftDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    try {
      await walletService.softDeleteTransaction(id);
      setMessage("Đã xóa giao dịch thành công.");
      fetchTransactions();
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Không thể xóa giao dịch"
      );
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Khôi phục giao dịch đã xóa?")) return;
    try {
      await walletService.restoreTransaction(id);
      setMessage("Đã khôi phục giao dịch thành công.");
      fetchTransactions();
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Không thể khôi phục giao dịch"
      );
    }
  };

  const handleUpdate = async (id, status) => {
    const transaction = transactions.find((tx) => tx._id === id);
    const userName = transaction?.user?.name || "user";
    const amount = transaction?.amount
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(transaction.amount)
      : "";

    const confirmMessage =
      status === "success"
        ? `Xác nhận thanh toán thành công cho ${userName} với số tiền ${amount}?`
        : `Đánh dấu giao dịch của ${userName} là thất bại?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await walletService.updateTransactionStatus(id, status);
      if (status === "success") {
        setMessage(
          `Đã xác nhận thanh toán thành công cho ${userName}. Số tiền ${amount} đã được cộng vào wallet.`
        );
      } else {
        setMessage(`Đã đánh dấu giao dịch của ${userName} là thất bại.`);
      }
      fetchTransactions();
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          "Không thể cập nhật trạng thái giao dịch"
      );
    }
  };

  // ---------------- FETCH ----------------
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await walletService.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      setMessage("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- RENDER ----------------
  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "deleted") return tx.isDeleted;
    return tx.status === filter && !tx.isDeleted; // hide deleted unless filter specifically "deleted"
  });

  return (
    <div>
      <h3>Wallet Transactions</h3>
      <div className="admin-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="deleted">Deleted</option>
        </select>
        <button
          className="outline-btn"
          onClick={fetchTransactions}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {message && <p className="info-text">{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>User</th>
              <th>Amount</th>
              <th>Bank</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx._id} className={tx.isDeleted ? "deleted-row" : ""}>
                <td>{tx.referenceCode}</td>
                <td>{tx.user?.name || "Unknown"}</td>
                <td>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(tx.amount)}
                </td>
                <td>{tx.bank?.toUpperCase()}</td>
                <td>
                  <span className={`status ${tx.status}`}>{tx.status}</span>
                </td>
                <td>{new Date(tx.createdAt).toLocaleString("vi-VN")}</td>
                <td>
                  {!tx.isDeleted ? (
                    <>
                      {tx.status === "pending" && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => handleUpdate(tx._id, "success")}
                          >
                            Mark Success
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleUpdate(tx._id, "failed")}
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleSoftDelete(tx._id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() => handleRestore(tx._id)}
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTransactions;

