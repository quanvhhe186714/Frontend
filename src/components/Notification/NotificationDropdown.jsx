import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { markAsRead } from '../../services/notification';

// Hàm định dạng thời gian
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "vừa xong";
};

const NotificationDropdown = ({ setIsOpen }) => {
    const { notifications, isLoading, error, handleMarkAllRead, loadUnreadCount, loadNotifications, setNotifications} = useNotifications();

    const handleReadClick = async (id, isRead) => {
        if (!isRead) {
            try {
                await markAsRead(id);
                setNotifications(prev => 
                    prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
                );

                loadUnreadCount();
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }
    };

    return (
        <div className="notification-dropdown-container">
            <div className="dropdown-header">
                <h3>🔔 Thông báo</h3>
                {notifications.some(n => !n.isRead) && (
                    <button className="btn-mark-all" onClick={handleMarkAllRead}>
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>

            <div className="dropdown-content">
                {isLoading && <div className="loading-state">Đang tải...</div>}
                {error && <div className="error-state">{error}</div>}
                
                {!isLoading && notifications.length === 0 && (
                    <div className="empty-state">Bạn không có thông báo nào.</div>
                )}
                
                {!isLoading && notifications.map((n) => (
                    <div 
                        key={n._id} 
                        className={`notification-item ${!n.isRead ? 'unread' : 'read'}`}
                        onClick={() => handleReadClick(n._id, n.isRead)}
                    >
                        <div className="content-box">
                            <p className="message">{n.content}</p>
                            <span className="timestamp">{timeAgo(n.createdAt)}</span>
                        </div>
                        {!n.isRead && <span className="unread-dot"></span>}
                    </div>
                ))}
            </div>

            <div className="dropdown-footer">
                <button onClick={() => setIsOpen(false)}>Đóng</button>
            </div>
        </div>
    );
};

export default NotificationDropdown;