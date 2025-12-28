import React, { useState, useEffect, useCallback } from "react";
import orderService from "../../services/order";
import { getAllCustomQRs } from "../../services/customQR";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [editedDates, setEditedDates] = useState({});
  const [customQRs, setCustomQRs] = useState([]);
  const [selectedQRForOrder, setSelectedQRForOrder] = useState({});

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
    try {
      const data = await orderService.getAllOrders();
      // #region agent log
      console.log('[DEBUG] fetchOrders - data received:', { isArray: Array.isArray(data), type: typeof data, data });
      fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminOrders.jsx:23',message:'fetchOrders - data received',data:{isArray:Array.isArray(data),type:typeof data,value:data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Ensure data is always an array
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      const initialDates = {};
      ordersArray.forEach((o) => {
        initialDates[o._id] = formatDateTimeLocal(o.createdAt);
      });
      setEditedDates(initialDates);
    } catch (error) {
      // #region agent log
      console.error('[DEBUG] fetchOrders - error:', error);
      fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminOrders.jsx:32',message:'fetchOrders - error',data:{error:error?.message,stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error(error);
      setOrders([]); // Set empty array on error
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchCustomQRs();
  }, [fetchOrders]);

  const fetchCustomQRs = async () => {
    try {
      const data = await getAllCustomQRs({ isActive: true });
      // #region agent log
      console.log('[DEBUG] fetchCustomQRs - data received:', { isArray: Array.isArray(data), type: typeof data, data });
      fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminOrders.jsx:42',message:'fetchCustomQRs - data received',data:{isArray:Array.isArray(data),type:typeof data,value:data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Ensure data is always an array
      const qrsArray = Array.isArray(data) ? data : [];
      setCustomQRs(qrsArray);
    } catch (error) {
      // #region agent log
      console.error('[DEBUG] fetchCustomQRs - error:', error);
      fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminOrders.jsx:46',message:'fetchCustomQRs - error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error("Failed to load custom QR codes:", error);
      setCustomQRs([]); // Set empty array on error
    }
  };

  const assignQRToOrder = async (orderId) => {
    try {
      const customQRId = selectedQRForOrder[orderId] || null;
      await orderService.assignCustomQRToOrder(orderId, customQRId);
      fetchOrders();
      setSelectedQRForOrder((prev) => ({ ...prev, [orderId]: null }));
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to assign QR code";
      alert(msg);
    }
  };

  const updateTimestamp = async (id) => {
    try {
      const value = editedDates[id];
      await orderService.updateOrderTimestamp(id, value);
      fetchOrders();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update time";
      alert(msg);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, status);
      fetchOrders();
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update status";
      alert(msg);
    }
  };

  return (
    <div>
      <h3>Manage Orders</h3>
      <table className="admin-table">
        <thead>
            <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Edit Time</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {Array.isArray(orders) ? orders.map(o => {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminOrders.jsx:98',message:'orders.map - checking order.items',data:{orderId:o?._id,itemsIsArray:Array.isArray(o?.items),itemsType:typeof o?.items,itemsValue:o?.items},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              return (
                <tr key={o._id}>
                    <td>{o._id.substring(0, 8)}...</td>
                    <td>{o.user?.name || "Unknown"}</td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(o.totalAmount)}
                    </td>
                    <td>
                        <span className={`status ${o.status}`}>{o.status}</span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                      <input
                        type="datetime-local"
                        value={editedDates[o._id] || ""}
                        onChange={(e) => setEditedDates((prev) => ({ ...prev, [o._id]: e.target.value }))}
                      />
                      <button className="edit-btn" onClick={() => updateTimestamp(o._id)}>Save</button>
                    </td>
                    <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {o.status === "pending" && (
                              <button className="edit-btn" onClick={() => updateStatus(o._id, "paid")}>Mark Paid</button>
                          )}
                          {o.status === "paid" && (
                              <button className="edit-btn" onClick={() => updateStatus(o._id, "delivered")}>Mark Delivered</button>
                          )}
                          {o.invoicePath && (
                              <button 
                                  className="edit-btn" 
                                  onClick={async () => {
                                      try {
                                          await orderService.downloadInvoice(o._id);
                                      } catch (error) {
                                          alert(error.response?.data?.message || 'Lỗi khi tải invoice');
                                      }
                                  }}
                                  style={{ marginRight: '5px' }}
                              >
                                  📄 Download Invoice
                              </button>
                          )}
                          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '5px' }}>
                            <select
                              value={selectedQRForOrder[o._id] || (o.customQRCode?._id || '')}
                              onChange={(e) => setSelectedQRForOrder((prev) => ({ ...prev, [o._id]: e.target.value || null }))}
                              style={{ padding: '4px', fontSize: '12px', flex: 1 }}
                            >
                              <option value="">-- Chọn QR code --</option>
                              {Array.isArray(customQRs) ? customQRs.map((qr) => (
                                <option key={qr._id} value={qr._id}>
                                  {qr.name}
                                </option>
                              )) : null}
                            </select>
                            <button
                              className="edit-btn"
                              onClick={() => assignQRToOrder(o._id)}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              Gán QR
                            </button>
                          </div>
                          {o.customQRCode && (
                            <span style={{ fontSize: '11px', color: '#28a745' }}>
                              QR: {o.customQRCode.name}
                            </span>
                          )}
                          <button className="delete-btn" onClick={() => updateStatus(o._id, "failed")}>Fail</button>
                        </div>
                    </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="7">Loading orders...</td></tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;

