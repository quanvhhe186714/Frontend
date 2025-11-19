import React, { useState, useEffect } from "react";
import orderService from "../../services/order";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
        await orderService.updateOrderStatus(id, status);
        fetchOrders();
    } catch (error) {
        alert("Failed to update status");
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
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {orders.map(o => (
                <tr key={o._id}>
                    <td>{o._id.substring(0, 8)}...</td>
                    <td>{o.user?.name || "Unknown"}</td>
                    <td>${o.totalAmount}</td>
                    <td>
                        <span className={`status ${o.status}`}>{o.status}</span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                        {o.status === "pending" && (
                            <button onClick={() => updateStatus(o._id, "paid")}>Mark Paid</button>
                        )}
                        {o.status === "paid" && (
                            <button onClick={() => updateStatus(o._id, "completed")}>Complete</button>
                        )}
                        <button onClick={() => updateStatus(o._id, "failed")}>Fail</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;

