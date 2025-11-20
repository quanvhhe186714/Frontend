import React, { useState, useEffect } from "react";
import api from "../../services/apiService";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: "", discountType: "percent", discountValue: 0, expirationDate: "", usageLimit: 100
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/coupons", formData);
      fetchCoupons();
      setFormData({ code: "", discountType: "percent", discountValue: 0, expirationDate: "", usageLimit: 100 });
    } catch (error) {
      alert("Error creating coupon");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this coupon?")) {
      try {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
      } catch (error) {
        alert("Error deleting coupon");
      }
    }
  };

  return (
    <div>
      <h3>Manage Coupons</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Code" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
        <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
            <option value="percent">Percent (%)</option>
            <option value="amount">Fixed Amount ($)</option>
        </select>
        <input type="number" placeholder="Value" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required />
        <input type="date" placeholder="Expiration" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} required />
        <input type="number" placeholder="Limit" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
        <button type="submit">Create</button>
      </form>

      <table className="admin-table">
        <thead>
            <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Expiry</th>
                <th>Used</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {coupons.map(c => (
                <tr key={c._id}>
                    <td>{c.code}</td>
                    <td>{c.discountType}</td>
                    <td>{c.discountValue}</td>
                    <td>{new Date(c.expirationDate).toLocaleDateString()}</td>
                    <td>{c.usedCount}/{c.usageLimit}</td>
                    <td>
                        <button className="delete-btn" onClick={() => handleDelete(c._id)}>Delete</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCoupons;

