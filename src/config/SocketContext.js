import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SocketContext = React.createContext();

function SocketProvider({ children }) {
  const [messages, setMessages] = useState({});
  const clientRef = useRef(null);

  // 구독 정보를 저장 (중복 구독 방지)
  const subscriptions = useRef({});

  // 연결 이전에 구독 요청이 들어오면 임시 저장해두는 변수
  const pendingRoomId = useRef(null);

  useEffect(() => { 
//    const sock = new SockJS("http://192.168.219.108/ws-chat");
    const sock = new SockJS("http://10.10.55.97/ws-chat");

    clientRef.current = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
      debug: (msg) => console.log(msg),

      // 연결된 후에만 subscribe 처리
      onConnect: () => {
        console.log("WebSocket 연결 성공");

        if (pendingRoomId.current) {
          subscribeRoom(pendingRoomId.current);
          pendingRoomId.current = null;
        }
      },
    });

    clientRef.current.activate();
    return () => clientRef.current?.deactivate();
  }, []);

  // 메시지 전송 함수
  const sendMessage = (room_id, msg) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn("WebSocket 연결 전 → 전송 불가");
      return;
    }

    clientRef.current.publish({
      destination: `/app/chat/${room_id}`,
      body: JSON.stringify({ ...msg, room_id }),
    });
  };

  // 방 구독 함수
  const subscribeRoom = (room_id) => {
    if (!clientRef.current?.connected) {
      pendingRoomId.current = room_id;
      return;
    }

    // 기존 구독 제거 (중복 방지)
    if (subscriptions.current[room_id]) {
      subscriptions.current[room_id].unsubscribe();
    }

    const sub = clientRef.current.subscribe(
      `/topic/chatroom/${room_id}`,
      (message) => {
        const body = JSON.parse(message.body);
        console.log("수신:", body);

        setMessages((prev) => ({
          ...prev,
          [room_id]: [...(prev[room_id] || []), body],
        }));
      }
    );

    subscriptions.current[room_id] = sub;
  };

  return (
    <SocketContext.Provider value={{ messages, sendMessage, subscribeRoom, setMessages }}>
      {children}
    </SocketContext.Provider>
  );
}

function useSocket() {
  return useContext(SocketContext);
}

export { SocketContext, SocketProvider, useSocket };
