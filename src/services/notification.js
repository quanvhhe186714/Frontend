import api from './apiService'; 

const NOTIFICATION_API_URL = '/notifications';

// Lấy danh sách thông báo của người dùng hiện tại 
export const fetchNotifications = async (page = 1, limit = 10) => {
    return api.get(NOTIFICATION_API_URL, {
        params: { page, limit }
    });
};

//Lấy số lượng thông báo chưa đọc 
export const getUnreadCount = async () => {
    return api.get(`${NOTIFICATION_API_URL}/unread-count`);
};


 // Đánh dấu một thông báo là đã đọc
export const markAsRead = async (notificationId) => {
    return api.patch(`${NOTIFICATION_API_URL}/${notificationId}/read`);
};

// Đánh dấu tất cả thông báo là đã đọc
export const markAllAsRead = async () => {
    return api.patch(`${NOTIFICATION_API_URL}/read-all`);
};