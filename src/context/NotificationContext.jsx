import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchNotifications, getUnreadCount, markAllAsRead } from '../services/notification'; 

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tải số lượng chưa đọc
    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await getUnreadCount(); 
            setUnreadCount(response.data.data.count);
        } catch (err) {
            console.error("Failed to load unread count:", err);
        }
    }, []);


    // Tải danh sách thông báo
    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchNotifications(1, 10); 
            setNotifications(response.data.data || []);
        } catch (err) {
            setError("Không thể tải danh sách thông báo.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            setError("Không thể đánh dấu tất cả là đã đọc.");
            console.error(err);
        }
    };

    useEffect(() => {
        loadUnreadCount();
    }, [loadUnreadCount]);

    const contextValue = {
        unreadCount,
        notifications,
        isLoading,
        error,
        loadNotifications,
        loadUnreadCount,
        handleMarkAllRead,
        setNotifications,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};