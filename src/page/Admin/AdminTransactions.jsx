import React, { useEffect, useState } from "react";
import walletService from "../../services/wallet";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleUpdate = async (id, status) => {
    if (!window.confirm(`Mark transaction as ${status}?`)) return;
    try {
      await walletService.updateTransactionStatus(id, status);
      setMessage("Updated transaction successfully");
      fetchTransactions();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update transaction");
    }
  };

  const filtered = transactions.filter((tx) =>
    filter === "all" ? true : tx.status === filter
  );

  return (
    <div>
      <h3>Wallet Transactions</h3>
      <div className="admin-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <button className="outline-btn" onClick={fetchTransactions} disabled={loading}>
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
              <tr key={tx._id}>
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
                  {tx.status === "pending" ? (
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
                  ) : (
                    <small>
                      {tx.status}{" "}
                      {tx.confirmedBy && `(by ${tx.confirmedBy?.name || "Admin"})`}
                    </small>
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

