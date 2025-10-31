// ✅ src/config/SocketContext.js
import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SocketContext = React.createContext();

function SocketProvider({ children }) {
  const [messages, setMessages] = useState({});
  const clientRef = useRef(null);
  const subscriptions = useRef({});
  const pendingRoomId = useRef(null);

  /** ✅ WebSocket 연결 */
  useEffect(() => {
    const sock = new SockJS("http://10.10.55.97/ws-chat");
    // const sock = new SockJS("http://192.168.219.108/ws-chat");

    clientRef.current = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 3000,
      debug: (str) => console.log("🧩 STOMP:", str),
      onConnect: () => {
        console.log("✅ WebSocket Connected!");
        if (pendingRoomId.current) {
          subscribeRoom(pendingRoomId.current);
          pendingRoomId.current = null;
        }
      },
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"], frame.body);
      },
      onWebSocketClose: () => console.warn("⚠️ WebSocket closed."),
    });

    clientRef.current.activate();

    return () => {
      console.log("🧹 WebSocket Disconnected");
      clientRef.current?.deactivate();
    };
  }, []);

  /** ✅ 메시지 전송 */
  const sendMessage = (roomId, msg) => {
    if (!clientRef.current?.connected) return;
    const payload = {
      ...msg,
      roomId,
      sendTime: new Date().toISOString(),
    };
    console.log("📨 sendMessage payload:", payload);

    clientRef.current.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(payload),
    });
  };

  /** ✅ 읽음 이벤트 전송 */
  const sendRead = (roomId, messageId, sender) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/chat/read/${roomId}`,
      body: JSON.stringify({
        roomId,
        messageId,
        sender,
        type: "READ",
      }),
    });
  };

  /** ✅ 방 구독 */
  const subscribeRoom = (roomId) => {
    if (!clientRef.current?.connected) {
      pendingRoomId.current = roomId;
      return;
    }

    // 기존 구독 해제
    subscriptions.current[roomId]?.unsubscribe();

    const sub = clientRef.current.subscribe(`/topic/chatroom/${roomId}`, (message) => {
      let body;
      try {
        body = JSON.parse(message.body);
      } catch (err) {
        console.error("❌ 메시지 파싱 실패:", err);
        return;
      }

      const msgType = body.type;

      setMessages((prev) => {
        const prevList = prev[roomId] || [];

        // ✅ READ 이벤트 → 기존 메시지의 readCount만 업데이트
        if (msgType === "READ" || msgType === "READ_UPDATE") {
          return {
            ...prev,
            [roomId]: prevList.map((m) =>
              m.messageId === body.messageId
                ? { ...m, readCount: body.readCount }
                : m
            ),
          };
        }

        // ✅ TALK / FILE / ENTER → 중복검사 후 append-only 구조 유지
        if (["TALK", "FILE", "ENTER", "SYSTEM"].includes(msgType)) {
          const exists = prevList.some((m) => m.messageId === body.messageId);
          if (exists) {
            // 이미 있으면 갱신만
            return {
              ...prev,
              [roomId]: prevList.map((m) =>
                m.messageId === body.messageId ? { ...m, ...body } : m
              ),
            };
          } else {
            // 새 메시지 append
            return {
              ...prev,
              [roomId]: [...prevList, body],
            };
          }
        }

        // ✅ LEAVE 등 기타 시스템 메시지도 append (원하면 주석처리 가능)
        if (msgType === "LEAVE") {
          return {
            ...prev,
            [roomId]: [...prevList, body],
          };
        }

        return prev;
      });

      // ✅ 새 메시지 오면 채팅방 리스트 업데이트 이벤트 발생
      if (["TALK", "FILE"].includes(msgType)) {
        try {
          window.dispatchEvent(
            new CustomEvent("chatRoomUpdated", { detail: { roomId } })
          );

          if (window.opener && !window.opener.closed) {
            window.opener.dispatchEvent(
              new CustomEvent("chatRoomUpdated", { detail: { roomId } })
            );
          }
        } catch (err) {
          console.warn("⚠️ chatRoomUpdated event dispatch failed:", err);
        }
      }
    });

    subscriptions.current[roomId] = sub;

    return () => {
      try {
        sub.unsubscribe();
        delete subscriptions.current[roomId];
        console.log(`🧹 unsubscribed from room ${roomId}`);
      } catch (err) {
        console.warn(`⚠️ unsubscribe error for room ${roomId}:`, err);
      }
    };
  };

  return (
    <SocketContext.Provider
      value={{
        messages,
        sendMessage,
        subscribeRoom,
        setMessages,
        sendRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

function useSocket() {
  return useContext(SocketContext);
}

export { SocketContext, SocketProvider, useSocket };
