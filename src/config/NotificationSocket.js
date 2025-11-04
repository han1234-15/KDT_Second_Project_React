import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useEffect, useState } from "react";
import { caxios } from "./config";



const NotificationSocket = () => {
  const [myInfo, setMyInfo] = useState(null);

  useEffect(() => {
    // 1️⃣ 유저 정보 불러오기
    caxios.get("/member/me").then((res) => {
      setMyInfo(res.data);
    });
  }, []);

  useEffect(() => {

    if (!myInfo?.id) return;

    console.log(myInfo.id);
    // 2️⃣ WebSocket 연결
    const client = Stomp.over(() => new SockJS("http://10.5.5.19/ws-notice"));
    client.debug = () => { };
    client.reconnectDelay = 5000;

    client.connect({}, () => {
      console.log("✅ 알림 WebSocket 연결됨");
      console.log("🟢 구독 경로:", `/notice/${myInfo.id}`);

      client.subscribe(`/notice/${myInfo.id}`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📩 새 알림:", data);

        window.dispatchEvent(new CustomEvent("new-notification", { detail: data }));

      });

      // 전체 알림 구독
      client.subscribe(`/notice/all`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📢 전체 알림:", data);
        window.dispatchEvent(new CustomEvent("new-notification", { detail: data }));
      });

    });

    return () => {
       client.deactivate();
    };
  }, [myInfo]);

  return null;
};

export default NotificationSocket;