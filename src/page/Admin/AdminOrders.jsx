import React, { useCallback, useEffect, useMemo, useState } from "react";
import orderService from "../../services/order";
import { getAllCustomQRs } from "../../services/customQR";

const statusOptions = ["pending", "paid", "delivered", "completed", "failed", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [editedDates, setEditedDates] = useState({});
  const [customQRs, setCustomQRs] = useState([]);
  const [selectedQRForOrder, setSelectedQRForOrder] = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const formatDateTimeLocal = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      const initialDates = {};
      ordersArray.forEach((order) => {
        initialDates[order._id] = formatDateTimeLocal(order.createdAt);
      });
      setEditedDates(initialDates);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the tai danh sach don hang");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomQRs = async () => {
    try {
      const response = await getAllCustomQRs({ isActive: true });
      const data = response?.data || response;
      setCustomQRs(Array.isArray(data) ? data : []);
    } catch {
      setCustomQRs([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomQRs();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const money = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const updateTimestamp = async (id) => {
    try {
      await orderService.updateOrderTimestamp(id, editedDates[id]);
      setMessage("Da cap nhat thoi gian don hang");
      fetchOrders();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the cap nhat thoi gian");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, status);
      setMessage(`Da chuyen don hang sang ${status}`);
      fetchOrders();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the cap nhat trang thai");
    }
  };

  const assignQRToOrder = async (orderId) => {
    try {
      const customQRId = selectedQRForOrder[orderId] || null;
      await orderService.assignCustomQRToOrder(orderId, customQRId);
      setMessage(customQRId ? "Da gan QR cho don hang" : "Da bo QR khoi don hang");
      setSelectedQRForOrder((prev) => ({ ...prev, [orderId]: null }));
      fetchOrders();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the gan QR");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? It will be hidden from the customer profile.")) return;
    try {
      await orderService.softDeleteOrder(orderId);
      setMessage("Da xoa don hang. Don nay se khong con hien o tai khoan user.");
      fetchOrders();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the xoa don hang");
    }
  };

  const renderItem = (item, index) => {
    if (item.type === "service") {
      const urls = item.serviceUrls || {};
      return (
        <li key={index}>
          <strong>{item.name}</strong>
          <div className="admin-order-meta">
            {new Intl.NumberFormat("vi-VN").format(item.serviceQuantity || 0)}{" "}
            {item.serviceUnitLabel || "luot"} | {money(item.price)}
          </div>
          {Object.entries(urls).map(([key, value]) => (
            <div className="admin-order-link" key={key}>
              {key}: <a href={value} target="_blank" rel="noreferrer">{value}</a>
            </div>
          ))}
          {item.serviceServer?.name && <div className="admin-order-meta">Server: {item.serviceServer.name}</div>}
          {item.serviceEmotion && <div className="admin-order-meta">Cam xuc: {item.serviceEmotion}</div>}
        </li>
      );
    }

    return (
      <li key={index}>
        <strong>{item.name}</strong> x {item.quantity} | {money(item.price * item.quantity)}
      </li>
    );
  };

  return (
    <div>
      <h3>Manage Orders</h3>
      <div className="admin-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button className="outline-btn" onClick={fetchOrders} disabled={loading}>
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
              <th>Order</th>
              <th>User</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>#{order._id.substring(0, 8)}</td>
                <td>
                  <strong>{order.user?.name || "Unknown"}</strong>
                  <div className="admin-order-meta">{order.user?.email}</div>
                  {order.paymentDetails?.telegramUsername && (
                    <div className="admin-order-meta">Telegram: {order.paymentDetails.telegramUsername}</div>
                  )}
                </td>
                <td>
                  <ul className="admin-order-items">
                    {(order.items || []).map(renderItem)}
                  </ul>
                </td>
                <td>{money(order.totalAmount)}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
                <td>
                  <input
                    type="datetime-local"
                    value={editedDates[order._id] || ""}
                    onChange={(e) => setEditedDates((prev) => ({ ...prev, [order._id]: e.target.value }))}
                  />
                  <button className="edit-btn" onClick={() => updateTimestamp(order._id)}>Save</button>
                </td>
                <td>
                  <div className="admin-order-actions">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <select
                      value={selectedQRForOrder[order._id] ?? (order.customQRCode?._id || "")}
                      onChange={(e) => setSelectedQRForOrder((prev) => ({ ...prev, [order._id]: e.target.value || null }))}
                    >
                      <option value="">No custom QR</option>
                      {customQRs.map((qr) => (
                        <option key={qr._id} value={qr._id}>{qr.name}</option>
                      ))}
                    </select>
                    <button className="edit-btn" onClick={() => assignQRToOrder(order._id)}>Save QR</button>
                    {order.invoicePath && (
                      <button className="edit-btn" onClick={() => orderService.downloadInvoice(order._id)}>
                        Invoice
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => deleteOrder(order._id)}>
                      Delete Order
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan="7">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
