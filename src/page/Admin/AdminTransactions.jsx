import React, { useEffect, useMemo, useState } from "react";
import orderService from "../../services/order";
import walletService from "../../services/wallet";

const transactionStatusOptions = ["all", "pending", "success", "failed", "deleted"];
const orderProgressOptions = [
  { value: "paid", label: "Paid" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Done" },
  { value: "failed", label: "Fail" },
  { value: "cancelled", label: "Cancel" },
];

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const shortId = (id) => `#${String(id || "").slice(-8)}`;

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [ordersByUser, setOrdersByUser] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState({});
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await walletService.getAllTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === "all") return !tx.isDeleted;
      if (filter === "deleted") return tx.isDeleted;
      return tx.status === filter && !tx.isDeleted;
    });
  }, [transactions, filter]);

  const loadUserOrders = async (userId, force = false) => {
    if (!userId) return;
    if (!force && ordersByUser[userId]) return;

    try {
      setLoadingOrders((prev) => ({ ...prev, [userId]: true }));
      const orders = await orderService.getPendingByUser(userId);
      setOrdersByUser((prev) => ({ ...prev, [userId]: Array.isArray(orders) ? orders : [] }));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Cannot load user orders");
    } finally {
      setLoadingOrders((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserOrders = async (userId) => {
    const willOpen = !expandedUsers[userId];
    setExpandedUsers((prev) => ({ ...prev, [userId]: willOpen }));
    if (willOpen) await loadUserOrders(userId);
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await walletService.softDeleteTransaction(id);
      setMessage("Transaction deleted.");
      fetchTransactions();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Cannot delete transaction");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this transaction?")) return;
    try {
      await walletService.restoreTransaction(id);
      setMessage("Transaction restored.");
      fetchTransactions();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Cannot restore transaction");
    }
  };

  const handleUpdateTransaction = async (id, status) => {
    const transaction = transactions.find((tx) => tx._id === id);
    const userName = transaction?.user?.name || "user";
    const amount = money(transaction?.amount);
    const confirmMessage =
      status === "success"
        ? `Confirm payment ${amount} for ${userName}?`
        : `Mark payment ${amount} from ${userName} as failed?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await walletService.updateTransactionStatus(id, status);
      setMessage(status === "success" ? "Payment confirmed. Now update the order progress below." : "Payment marked failed.");
      await fetchTransactions();
      if (transaction?.user?._id) {
        setExpandedUsers((prev) => ({ ...prev, [transaction.user._id]: true }));
        await loadUserOrders(transaction.user._id, true);
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Cannot update transaction status");
    }
  };

  const handleUpdateOrder = async (userId, orderId, status) => {
    const label = orderProgressOptions.find((option) => option.value === status)?.label || status;
    if (!window.confirm(`Move order ${shortId(orderId)} to ${label}?`)) return;

    try {
      await orderService.updateOrderStatus(orderId, status);
      setMessage(`Order ${shortId(orderId)} moved to ${label}.`);
      await loadUserOrders(userId, true);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Cannot update order status");
    }
  };

  const renderOrderItem = (item, index) => {
    if (item.type === "service") {
      return (
        <li key={index}>
          <strong>{item.name}</strong>
          <div className="admin-order-meta">
            {new Intl.NumberFormat("vi-VN").format(item.serviceQuantity || 0)} {item.serviceUnitLabel || "luot"} | {money(item.price)}
          </div>
          {item.serviceUrls &&
            Object.entries(item.serviceUrls).map(([key, value]) => (
              <div className="admin-order-link" key={key}>
                {key}: <a href={value} target="_blank" rel="noreferrer">{value}</a>
              </div>
            ))}
          {item.serviceServer?.name && <div className="admin-order-meta">Server: {item.serviceServer.name}</div>}
          {item.serviceEmotion && <div className="admin-order-meta">Emotion: {item.serviceEmotion}</div>}
        </li>
      );
    }

    return (
      <li key={index}>
        <strong>{item.name}</strong> x {item.quantity} | {money((item.price || 0) * (item.quantity || 1))}
      </li>
    );
  };

  const renderUserOrders = (userId) => {
    if (!expandedUsers[userId]) return null;

    const orders = ordersByUser[userId] || [];
    return (
      <div className="admin-progress-panel">
        <div className="admin-progress-head">
          <strong>Pending service progress</strong>
          <button className="outline-btn compact" onClick={() => loadUserOrders(userId, true)} disabled={loadingOrders[userId]}>
            Refresh orders
          </button>
        </div>

        {loadingOrders[userId] ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No pending, paid, or delivered orders for this user.</p>
        ) : (
          <div className="admin-progress-list">
            {orders.map((order) => (
              <div className="admin-progress-card" key={order._id}>
                <div className="admin-progress-main">
                  <div>
                    <strong>{shortId(order._id)}</strong>
                    <div className="admin-order-meta">
                      {new Date(order.createdAt).toLocaleString("vi-VN")} | {money(order.totalAmount)}
                    </div>
                  </div>
                  <span className={`status ${order.status}`}>{order.status}</span>
                </div>

                <ul className="admin-order-items">
                  {(order.items || []).map(renderOrderItem)}
                </ul>

                <div className="admin-progress-actions">
                  {orderProgressOptions.map((option) => (
                    <button
                      key={option.value}
                      className={option.value === "failed" || option.value === "cancelled" ? "delete-btn" : "edit-btn"}
                      onClick={() => handleUpdateOrder(userId, order._id, option.value)}
                      disabled={order.status === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h3>Payments & Service Progress</h3>
      <div className="admin-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {transactionStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All active" : status}
            </option>
          ))}
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
              <th>Payment</th>
              <th>Created</th>
              <th>Payment Actions</th>
              <th>Order Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => {
              const userId = tx.user?._id;
              return (
                <tr key={tx._id} className={tx.isDeleted ? "deleted-row" : ""}>
                  <td>{tx.referenceCode}</td>
                  <td>
                    <strong>{tx.user?.name || "Unknown"}</strong>
                    <div className="admin-order-meta">{tx.user?.email}</div>
                  </td>
                  <td>{money(tx.amount)}</td>
                  <td>{tx.bank?.toUpperCase()}</td>
                  <td><span className={`status ${tx.status}`}>{tx.status}</span></td>
                  <td>{new Date(tx.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    {!tx.isDeleted ? (
                      <>
                        {tx.status === "pending" && (
                          <>
                            <button className="edit-btn" onClick={() => handleUpdateTransaction(tx._id, "success")}>
                              Mark Success
                            </button>
                            <button className="delete-btn" onClick={() => handleUpdateTransaction(tx._id, "failed")}>
                              Mark Failed
                            </button>
                          </>
                        )}
                        <button className="delete-btn" onClick={() => handleSoftDelete(tx._id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <button className="edit-btn" onClick={() => handleRestore(tx._id)}>
                        Restore
                      </button>
                    )}
                  </td>
                  <td>
                    {userId ? (
                      <>
                        <button className="edit-btn" onClick={() => toggleUserOrders(userId)}>
                          {expandedUsers[userId] ? "Hide Orders" : "Manage Orders"}
                        </button>
                        {renderUserOrders(userId)}
                      </>
                    ) : (
                      <span className="admin-order-meta">No user</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTransactions;
