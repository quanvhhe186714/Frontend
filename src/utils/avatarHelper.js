// Helper function để xử lý avatar URL
export const getAvatarUrl = (avatar) => {
  if (!avatar || avatar.trim() === '') return null;
  
  // Nếu đã là full URL (http/https), trả về nguyên
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // Nếu là Cloudinary URL relative (bắt đầu bằng /), thêm base URL
  if (avatar.startsWith('/')) {
    // Cloudinary URL thường có format: /v1234567890/folder/image.jpg
    // Cần thêm base URL: https://res.cloudinary.com/{cloud_name}/image/upload
    // Nhưng vì không biết cloud_name, nên trả về null để hiển thị placeholder
    // Hoặc có thể là full URL đã được lưu nhưng thiếu protocol
    console.warn('Avatar URL is relative path:', avatar);
    return null;
  }
  
  // Trả về null để hiển thị placeholder
  return null;
};

// Helper function để xử lý lỗi khi load avatar
export const handleAvatarError = (e) => {
  // Ẩn image và để placeholder hiển thị
  e.target.style.display = 'none';
  // Hoặc set src thành placeholder
  // e.target.src = 'https://via.placeholder.com/150';
};

