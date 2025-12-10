import React, { useState, useEffect, useCallback } from "react";
import orderService from "../../services/order";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [editedDates, setEditedDates] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      const initialDates = {};
      data.forEach((o) => {
        initialDates[o._id] = toDateTimeLocal(o.createdAt);
      });
      setEditedDates(initialDates);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const toDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    // Align to local timezone for input value
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
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
            {orders.map(o => (
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
                        {o.status === "pending" && (
                            <button className="edit-btn" onClick={() => updateStatus(o._id, "paid")}>Mark Paid</button>
                        )}
                        {o.status === "paid" && (
                            <button className="edit-btn" onClick={() => updateStatus(o._id, "delivered")}>Mark Delivered</button>
                        )}
                        <button className="delete-btn" onClick={() => updateStatus(o._id, "failed")}>Fail</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;

