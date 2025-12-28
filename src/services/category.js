import api from "./apiService";

const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

const getCategoriesAdmin = async () => {
  const response = await api.get("/categories/admin");
  return response.data;
};

const createCategory = async (data) => {
  const response = await api.post("/categories", data);
  return response.data;
};

const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

const categoryService = {
  getCategories,
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;

