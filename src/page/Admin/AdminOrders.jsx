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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
      setSelectedOrders([]); // Clear selection on refresh
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
    let result = orders;
    
    if (filter !== "all") {
      result = result.filter((order) => order.status === filter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(term) ||
        (order.user?.name && order.user.name.toLowerCase().includes(term)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(term))
      );
    }
    
    return result;
  }, [orders, filter, searchTerm]);

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

  // --- BULK ACTIONS ---
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const toggleSelect = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkUpdateStatus = async (status) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển ${selectedOrders.length} đơn hàng sang trạng thái '${status}'?`)) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedOrders.map(id => orderService.updateOrderStatus(id, status)));
      setMessage(`Đã cập nhật trạng thái ${selectedOrders.length} đơn hàng thành công.`);
      fetchOrders();
    } catch (error) {
      setMessage("Lỗi khi cập nhật trạng thái hàng loạt.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedOrders.length} đơn hàng đã chọn?`)) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedOrders.map(id => orderService.softDeleteOrder(id)));
      setMessage(`Đã xóa ${selectedOrders.length} đơn hàng thành công.`);
      fetchOrders();
    } catch (error) {
      setMessage("Lỗi khi xóa hàng loạt.");
    } finally {
      setBulkActionLoading(false);
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
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Manage Orders</h3>
      </div>
      
      <div className="admin-filters">
        <input 
          type="text" 
          placeholder="Tìm kiếm theo ID, Email, Tên..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ minWidth: '250px' }}
        />
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

      {selectedOrders.length > 0 && (
        <div className="admin-bulk-actions" style={{
          background: 'rgba(67, 24, 255, 0.05)', 
          padding: '10px 20px', 
          borderRadius: '10px', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          border: '1px solid rgba(67, 24, 255, 0.2)'
        }}>
          <span style={{ fontWeight: 600, color: '#4318FF' }}>Đã chọn {selectedOrders.length} mục</span>
          
          <select 
            onChange={(e) => {
              if(e.target.value) handleBulkUpdateStatus(e.target.value);
              e.target.value = "";
            }}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            disabled={bulkActionLoading}
          >
            <option value="">-- Đổi trạng thái --</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button 
            className="delete-btn" 
            onClick={handleBulkDelete}
            disabled={bulkActionLoading}
            style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Xóa hàng loạt
          </button>
        </div>
      )}

      {message && <p className="info-text">{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={toggleSelectAll} 
                  checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length} 
                />
              </th>
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
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.includes(order._id)}
                    onChange={() => toggleSelect(order._id)}
                  />
                </td>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input
                      type="datetime-local"
                      value={editedDates[order._id] || ""}
                      onChange={(e) => setEditedDates((prev) => ({ ...prev, [order._id]: e.target.value }))}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button className="edit-btn" onClick={() => updateTimestamp(order._id)}>Save</button>
                  </div>
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
              <tr><td colSpan="8" style={{ textAlign: "center" }}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
