import React, { useState, useEffect } from "react";
import productService from "../../services/product";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, duration_months: 1, features: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim())
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
      } else {
        await productService.createProduct(payload);
      }
      setEditingProduct(null);
      setFormData({ name: "", description: "", price: 0, duration_months: 1, features: "" });
      fetchProducts();
    } catch (error) {
      alert("Error saving product");
    }
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    setFormData({
        name: p.name,
        description: p.description,
        price: p.price,
        duration_months: p.duration_months,
        features: p.features.join(', ')
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h3>Manage Products</h3>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
        <input type="number" placeholder="Months" value={formData.duration_months} onChange={e => setFormData({...formData, duration_months: e.target.value})} required />
        <input placeholder="Features (comma separated)" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
        <button type="submit">{editingProduct ? "Update" : "Create"}</button>
        {editingProduct && <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>}
      </form>

      <table className="admin-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {products.map(p => (
                <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>${p.price}</td>
                    <td>{p.duration_months}m</td>
                    <td>
                        <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;

