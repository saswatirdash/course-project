import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: Notification['type']) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "Welcome back!", message: "Your Progress Hub is waiting. Set a goal for today.", time: "JUST NOW", read: false },
  ]);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      time: "JUST NOW",
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
