// notification.tsx
import { notification } from "antd";
import type { ReactNode } from "react";

type NotificationType = "success" | "info" | "warning" | "error";

export const useOpenNotification = (): {
  openNotification: (type: NotificationType, message: string, description?: string) => void;
  contextHolder: ReactNode;
} => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (type: NotificationType, message: string, description?: string) => {
    api[type]({
      message,
      description,
      placement: "topRight",
    });
  };

  return { openNotification, contextHolder };
};
