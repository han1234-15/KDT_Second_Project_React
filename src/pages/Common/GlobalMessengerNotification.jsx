
import { useEffect } from "react";
import { notification } from "antd";
import { MessageOutlined } from "@ant-design/icons";

const GlobalMessengerNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const handler = (e) => {
      api.open({
        message: "📨 메신저",
        description: "메시지가 도착했습니다.",
        icon: <MessageOutlined style={{ color: "#1677ff" }} />,
        placement: "bottomRight",
        duration: 4,
      });
    };

    window.addEventListener("globalMessengerNotify", handler);
    return () => window.removeEventListener("globalMessengerNotify", handler);
  }, [api]);

  return <>{contextHolder}</>;
};

export default GlobalMessengerNotification;
