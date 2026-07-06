"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type NotificationType = "success" | "error";

type Notification = {
  id: number;
  message: string;
  type: NotificationType;
} | null;

type AdminNotificationContextValue = {
  showNotification: (message: string, type?: NotificationType) => void;
};

const AdminNotificationContext =
  createContext<AdminNotificationContextValue | null>(null);

export function AdminNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notification, setNotification] = useState<Notification>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationType = "success") => {
      setNotification({
        id: Date.now(),
        message,
        type,
      });
    },
    []
  );

  useEffect(() => {
    if (!notification) return;

    const timeout = window.setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [notification]);

  return (
    <AdminNotificationContext.Provider value={{ showNotification }}>
      {children}

      {notification && (
        <div
          className={`admin-notification admin-notification--${notification.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{notification.message}</span>

          <button
            aria-label="Benachrichtigung schließen"
            onClick={() => setNotification(null)}
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(AdminNotificationContext);

  if (!context) {
    throw new Error(
      "useAdminNotification must be used inside AdminNotificationProvider"
    );
  }

  return context;
}