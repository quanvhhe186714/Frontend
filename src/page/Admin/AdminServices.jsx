import React, { useEffect, useMemo, useState } from "react";
import facebookService from "../../services/facebook/facebookService";

const platforms = ["facebook", "tiktok", "youtube", "instagram", "twitter", "telegram"];
const statuses = ["stable", "slow", "dropping", "maintenance"];
const serviceTypes = [
  "LIKE_POST",
  "LIKE_COMMENT",
  "LIKE_FANPAGE",
  "LIKE_REELS",
  "FOLLOW",
  "COMMENT",
  "COMMENT_REELS",
  "SHARE_POST",
  "SHARE_GROUP",
  "SHARE_LIVESTREAM",
  "SHARE_REELS",
  "VIEW_STORY",
  "VIEW_VIDEO",
  "VIEW_REELS",
  "VIEW_LIVESTREAM",
  "RATE_FANPAGE",
  "MEMBER_GROUP",
];

const defaultForm = {
  name: "",
  code: "",
  platform: "facebook",
  description: "",
  icon: "S",
  basePrice: 10000,
  unit: "1000",
  unitLabel: "luot",
  minPrice: 0,
  maxPrice: "",
  processingTime: 5,
  completionTime: 60,
  serviceType: "LIKE_POST",
  requiredFields: "post_url",
  displayOrder: 0,
  status: "stable",
  dropRate: 0,
  warrantyDays: 30,
};

const toPayload = (form) => ({
  ...form,
  basePrice: Number(form.basePrice) || 0,
  minPrice: Number(form.minPrice) || 0,
  maxPrice: form.maxPrice === "" ? null : Number(form.maxPrice),
  processingTime: Number(form.processingTime) || 0,
  completionTime: Number(form.completionTime) || 0,
  displayOrder: Number(form.displayOrder) || 0,
  dropRate: Number(form.dropRate) || 0,
  warrantyDays: Number(form.warrantyDays) || 0,
  requiredFields: String(form.requiredFields || "")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean),
});

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [platform, setPlatform] = useState("facebook");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const editingService = useMemo(
    () => services.find((service) => service._id === editingId),
    [services, editingId]
  );

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await facebookService.getServices(platform);
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the tai dich vu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...defaultForm, platform });
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name || "",
      code: service.code || "",
      platform: service.platform || "facebook",
      description: service.description || "",
      icon: service.icon || "S",
      basePrice: service.basePrice || 0,
      unit: service.unit || "1000",
      unitLabel: service.unitLabel || "luot",
      minPrice: service.minPrice || 0,
      maxPrice: service.maxPrice ?? "",
      processingTime: service.processingTime || 0,
      completionTime: service.completionTime || 0,
      serviceType: service.serviceType || "LIKE_POST",
      requiredFields: (service.requiredFields || []).join(", "),
      displayOrder: service.displayOrder || 0,
      status: service.status || "stable",
      dropRate: service.dropRate || 0,
      warrantyDays: service.warrantyDays || 30,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = toPayload(form);
      if (editingId) {
        await facebookService.updateService(editingId, payload);
        setMessage("Da cap nhat dich vu");
      } else {
        await facebookService.createService(payload);
        setMessage("Da tao dich vu moi");
      }
      resetForm();
      loadServices();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the luu dich vu");
    }
  };

  const deleteService = async (service) => {
    if (!window.confirm(`Delete service "${service.name}"? It will be hidden from customers.`)) return;
    try {
      await facebookService.deleteService(service._id);
      setMessage("Da xoa dich vu khoi trang user");
      loadServices();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Khong the xoa dich vu");
    }
  };

  return (
    <div>
      <h3>Service Management</h3>
      <div className="admin-filters">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          {platforms.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <button className="outline-btn" onClick={loadServices} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && <p className="info-text">{message}</p>}

      <form className="admin-service-form" onSubmit={handleSubmit}>
        <h4>{editingService ? `Edit: ${editingService.name}` : "Create service"}</h4>
        <div className="admin-service-grid">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          <input name="code" value={form.code} onChange={handleChange} placeholder="Code" required disabled={!!editingId} />
          <select name="platform" value={form.platform} onChange={handleChange}>
            {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select name="serviceType" value={form.serviceType} onChange={handleChange}>
            {serviceTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input name="basePrice" type="number" value={form.basePrice} onChange={handleChange} placeholder="Base price" required />
          <input name="unit" value={form.unit} onChange={handleChange} placeholder="Unit" />
          <input name="unitLabel" value={form.unitLabel} onChange={handleChange} placeholder="Unit label" />
          <input name="icon" value={form.icon} onChange={handleChange} placeholder="Icon or image URL" />
          <input name="requiredFields" value={form.requiredFields} onChange={handleChange} placeholder="Required fields: post_url, fanpage_url" />
          <select name="status" value={form.status} onChange={handleChange}>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input name="dropRate" type="number" value={form.dropRate} onChange={handleChange} placeholder="Drop rate %" />
          <input name="warrantyDays" type="number" value={form.warrantyDays} onChange={handleChange} placeholder="Warranty days" />
          <input name="processingTime" type="number" value={form.processingTime} onChange={handleChange} placeholder="Start minutes" />
          <input name="completionTime" type="number" value={form.completionTime} onChange={handleChange} placeholder="Done minutes" />
          <input name="minPrice" type="number" value={form.minPrice} onChange={handleChange} placeholder="Min price" />
          <input name="maxPrice" type="number" value={form.maxPrice} onChange={handleChange} placeholder="Max price" />
          <input name="displayOrder" type="number" value={form.displayOrder} onChange={handleChange} placeholder="Display order" />
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <div className="admin-service-actions">
          <button className="edit-btn" type="submit">{editingId ? "Save Service" : "Create Service"}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Platform</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>
                  <strong>{service.name}</strong>
                  <div className="admin-order-meta">{service.code}</div>
                </td>
                <td>{service.platform}</td>
                <td>{service.serviceType}</td>
                <td>{new Intl.NumberFormat("vi-VN").format(service.basePrice)} VND / {service.unit} {service.unitLabel}</td>
                <td><span className={`status ${service.status}`}>{service.status}</span></td>
                <td>
                  <button className="edit-btn" onClick={() => startEdit(service)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteService(service)}>Delete</button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan="6">No services found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminServices;
