// src/config/NotificationSocket.jsx
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useEffect, useState } from "react";
import { caxios } from "./config";

const NotificationSocket = () => {
  const [myInfo, setMyInfo] = useState(null);

  // 1️⃣ 유저 정보 불러오기
  useEffect(() => {
    caxios.get("/member/me").then((res) => {
      setMyInfo(res.data);
    });
  }, []);

  // 2️⃣ 기존 알림 서버 연결 유지
  useEffect(() => {
    if (!myInfo?.id) return;

    console.log(myInfo.id);
    // const client = Stomp.over(() => new SockJS("http://192.168.119.210/ws-notice"));
    const client = Stomp.over(() => new SockJS("http://10.10.55.97/ws-notice"));

    client.debug = () => {};
    client.reconnectDelay = 5000;

    client.connect({}, () => {
      console.log("✅ 알림 WebSocket 연결됨");
      console.log("🟢 구독 경로:", `/notice/${myInfo.id}`);

      client.subscribe(`/notice/${myInfo.id}`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📩 새 알림:", data);

        window.dispatchEvent(
          new CustomEvent("new-notification", { detail: data })
        );
      });
    });

    return () => {
      if (client.connected) client.disconnect();
    };
  }, [myInfo]);

  

  return null;
};

export default NotificationSocket;
