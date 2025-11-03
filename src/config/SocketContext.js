// src/config/SocketContext.js
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// 전역 소켓 컨텍스트 생성
const SocketContext = createContext();

function SocketProvider({ children }) {
  const [messages, setMessages] = useState({}); // 방별 메시지 목록 저장용
  const clientRef = useRef(null); // STOMP 클라이언트 인스턴스
  const subscriptions = useRef({}); // 구독 정보 관리
  const pendingRoomId = useRef(null); // 연결 전 대기 중인 구독 요청 보관

  /** WebSocket 연결 초기화 */
  useEffect(() => {
    const sock = new SockJS("http://192.168.219.108/ws-chat");

    clientRef.current = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 3000, // 자동 재연결 간격(ms)
      debug: (msg) => console.log("STOMP:", msg),

      // STOMP 연결 성공 시 실행
      onConnect: () => {
        console.log("WebSocket Connected.");

        const userId = sessionStorage.getItem("LoginID");
        if (userId) {
          try {
            // 개인 사용자 알림 구독 (/topic/user/{userId})
            const sub = clientRef.current.subscribe(
              `/topic/user/${userId}`,
              (message) => {
                let payload;
                try {
                  payload = JSON.parse(message.body);
                } catch {
                  return;
                }

                // 서버에서 새 방 생성 알림을 받은 경우
                if (payload.type === "NEW_ROOM") {
                  console.log("새 방 알림 수신:", payload);
                  // 채팅방 목록 새로고침 이벤트 발생
                  window.dispatchEvent(new Event("refreshChatRooms"));

                  // 팝업 창이 열려 있다면 부모 창에도 알림 전달
                  if (window.opener && !window.opener.closed) {
                    window.opener.dispatchEvent(new Event("refreshChatRooms"));
                  }
                }
              }
            );
            subscriptions.current[`user_${userId}`] = sub;
            console.log(`개인 구독 성공: /topic/user/${userId}`);
          } catch (err) {
            console.error("개인 구독 실패:", err);
          }
        }

        // 연결이 늦어서 대기 중이던 방 구독 요청 처리
        if (pendingRoomId.current) {
          subscribeRoom(pendingRoomId.current);
          pendingRoomId.current = null;
        }
      },

      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers["message"], frame.body);
      },

      onWebSocketClose: () => {
        console.warn("WebSocket closed.");
      },
    });

    // 실제 WebSocket 연결 활성화
    clientRef.current.activate();

    // 컴포넌트 unmount 시 연결 해제 및 구독 정리
    return () => {
      console.log("WebSocket Disconnected.");
      Object.values(subscriptions.current).forEach((s) => s.unsubscribe());
      clientRef.current?.deactivate();
    };
  }, []);

  /** 메시지 전송 함수 */
  const sendMessage = (roomId, msg) => {
    if (!clientRef.current?.connected) {
      console.warn("STOMP 연결 전 — 메시지 전송 불가");
      return;
    }

    // 전송할 데이터 구조 정의
    const payload = {
      ...msg,
      roomId,
      sendTime: new Date().toISOString(),
    };
    console.log("sendMessage payload:", payload);

    clientRef.current.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(payload),
    });
  };

  /** 읽음 처리 메시지 전송 */
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

  /** 방 구독 (중복 방지 및 안정화된 useCallback 사용) */
  const subscribeRoom = useCallback((roomId) => {
    // 연결 전이면 구독 대기 리스트에 추가
    if (!clientRef.current?.connected) {
      pendingRoomId.current = roomId;
      return;
    }

    // 이미 구독 중인 방이면 다시 구독하지 않음
    if (subscriptions.current[roomId]) {
      console.log(`이미 구독 중인 방: ${roomId}`);
      return;
    }

    // STOMP 구독 시작
    const sub = clientRef.current.subscribe(
      `/topic/chatroom/${roomId}`,
      (message) => {
        let body;
        try {
          body = JSON.parse(message.body);
        } catch (err) {
          console.error("메시지 파싱 실패:", err);
          return;
        }

        const msgType = body.type;

        // 기존 메시지 상태 업데이트
        setMessages((prev) => {
          const prevList = prev[roomId] || [];

          // 읽음 상태 업데이트 메시지
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

          // 일반 대화, 파일, 입장, 퇴장 등
          if (["TALK", "FILE", "ENTER", "SYSTEM", "LEAVE"].includes(msgType)) {
            const exists = prevList.some((m) => m.messageId === body.messageId);
            if (exists) {
              // 이미 있는 메시지면 업데이트만
              return {
                ...prev,
                [roomId]: prevList.map((m) =>
                  m.messageId === body.messageId ? { ...m, ...body } : m
                ),
              };
            } else {
              // 새 메시지는 목록에 추가
              return {
                ...prev,
                [roomId]: [...prevList, body],
              };
            }
          }

          return prev;
        });

        // 새 메시지 수신 시 채팅방 목록 갱신 이벤트 발생
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
            console.warn("chatRoomUpdated 이벤트 발생 실패:", err);
          }
        }
      }
    );

    // 구독 객체 저장
    subscriptions.current[roomId] = sub;
    console.log(`방 구독 성공: ${roomId}`);

    // 정리 함수 반환 (구독 해제)
    return () => {
      try {
        sub.unsubscribe();
        delete subscriptions.current[roomId];
        console.log(`구독 해제 완료: ${roomId}`);
      } catch (err) {
        console.warn(`구독 해제 실패 (${roomId}):`, err);
      }
    };
  }, []); // stompClient 의존성 제거 (ref로 접근하므로 불필요)

  /** Context value 제공 */
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

/** Context 전용 훅 */
function useSocket() {
  return useContext(SocketContext);
}

export { SocketContext, SocketProvider, useSocket };
