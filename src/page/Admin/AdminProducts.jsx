import React, { useState, useEffect } from "react";
import productService from "../../services/product";
import categoryService from "../../services/category";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, duration_months: 1, features: "", category: ""
  });
  const [categoryFormData, setCategoryFormData] = useState({
    code: "", name: "", order: 0, isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategoriesAdmin();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

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
      setFormData({ name: "", description: "", price: 0, duration_months: 1, features: "", category: "" });
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
        features: p.features.join(', '),
        category: p.category || ""
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

  // Category management handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, categoryFormData);
      } else {
        await categoryService.createCategory(categoryFormData);
      }
      setEditingCategory(null);
      setCategoryFormData({ code: "", name: "", order: 0, isActive: true });
      fetchCategories();
    } catch (error) {
      alert("Error saving category: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCategoryEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      code: cat.code,
      name: cat.name,
      order: cat.order,
      isActive: cat.isActive
    });
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm("Delete this category? All products in this category will be moved to 'OTHER'.")) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
        fetchProducts(); // Refresh products in case any were moved
      } catch (error) {
        alert("Error deleting category: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div>
      <h3>Manage Categories</h3>
      
      <form onSubmit={handleCategorySubmit} className="admin-form" style={{ marginBottom: 32 }}>
        <input placeholder="Code (e.g., PREMIUM)" value={categoryFormData.code} onChange={e => setCategoryFormData({...categoryFormData, code: e.target.value})} required />
        <input placeholder="Name (e.g., Premium)" value={categoryFormData.name} onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})} required />
        <input type="number" placeholder="Order" value={categoryFormData.order} onChange={e => setCategoryFormData({...categoryFormData, order: parseInt(e.target.value) || 0})} />
        <label>
          <input type="checkbox" checked={categoryFormData.isActive} onChange={e => setCategoryFormData({...categoryFormData, isActive: e.target.checked})} />
          Active
        </label>
        <button type="submit">{editingCategory ? "Update Category" : "Create Category"}</button>
        {editingCategory && <button type="button" onClick={() => setEditingCategory(null)}>Cancel</button>}
      </form>

      <table className="admin-table" style={{ marginBottom: 32 }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Order</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat._id}>
              <td>{cat.code}</td>
              <td>{cat.name}</td>
              <td>{cat.order}</td>
              <td>{cat.isActive ? "Yes" : "No"}</td>
              <td>
                <button className="edit-btn" onClick={() => handleCategoryEdit(cat)}>Edit</button>
                <button className="delete-btn" onClick={() => handleCategoryDelete(cat._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Manage Products</h3>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
        <input type="number" placeholder="Months" value={formData.duration_months} onChange={e => setFormData({...formData, duration_months: e.target.value})} required />
        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
          <option value="">Select Category</option>
          {categories.filter(c => c.isActive).map(cat => (
            <option key={cat._id} value={cat.code}>{cat.name}</option>
          ))}
        </select>
        <input placeholder="Features (comma separated)" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
        <button type="submit">{editingProduct ? "Update" : "Create"}</button>
        {editingProduct && <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>}
      </form>

      <table className="admin-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {products.map(p => (
                <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{categories.find(c => c.code === p.category)?.name || p.category || "N/A"}</td>
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

