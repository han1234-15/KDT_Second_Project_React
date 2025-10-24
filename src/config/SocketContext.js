import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';
import { App } from "antd";


// Context 객체 생성
const SocketContext = React.createContext(); // 이메서드를 호출하면 전역 저장소가 하나 생성됨
                                             // 차후 Provider로 값을 공급하고 useContext로 꺼내쓸 예정


//  Provider 컴포넌트: children을 감싸고 value를 공급
// 나중에 벨류에 메세지등 필요한 값 입력
function SocketProvider({children}){
    const [messages, setMessages] = useState({});
    //소켓 클라이언트 객체를 안전하게 보관하는 전역 변수 역활
    const clientRef = useRef(null); // useState 와 비슷하지만 값이변경 됐을때 useState는 컴포넌트가 다시랜더링되고
                                    // useRef는 리렌더링이 일어나도 값이 유지됨, 값이 바뀌어도 다시 렌더링 하지않음
                                    // 쓰는이유 stompClient 객체를 clientRef 안에 넣어둠
                                    // 소켓 연결 객체는 한번 만들면 계속 유지해야하기 때문에
                                    // 랜더링과 상관없이 같은 객체를 계속 유지하기 위해

    
useEffect(() => {
    // SockJS 인스턴스 생성 (백엔드 WebSocket 엔드포인트 주소)
    //const sock = new SockJS("http://10.10.55.97/ws-chat");
    const sock = new SockJS("http://192.168.119.210/ws-chat");
    // STOMP 클라이언트 생성
    clientRef.current = new Client({
      webSocketFactory: () => sock, // SockJS를 통해 WebSocket 연결 생성
      reconnectDelay: 5000,         // 연결이 끊어지면 5초 후 재연결 시도
      debug: (str) => console.log(str), // 디버그 로그 출력
      onConnect: () => { // onConnect: 서버와 연결이 성공했을 때 호출됨
        console.log("소켓 연결 성공"); // 연결 성공 시 실행되는 콜백
      },
    });

    // 소켓 연결 시작
    clientRef.current.activate();

    // cleanup 함수: 컴포넌트가 언마운트될 때 소켓 연결 해제
    return () => clientRef.current.deactivate();
  }, []); // []: 최초 마운트/언마운트 시에만 실행

  //메세지 전송 함수
  const sendMessage = (room_id, content) =>{
    // 연결이 안 되어 있으면 return
    if (!clientRef.current || !clientRef.current.connected) return;

    // 서버로 메세지 Pub
    clientRef.current.publish({ // 메세지를 보내는 스톰프 함수 publish
        destination: `/app/chat/${room_id}`, // 서버에서 매핑한 메세지 처리경로
        body: JSON.stringify(content),  // 메세지를 JSON 문자열로 변환해서 전송
    });
  };

  //특정 방 구독 함수
  //room_id: 구독할 채딩방 id
  const subscribeRoom = (room_id)=>{

    if(!clientRef.current) return;

    //서버에서 해당 채팅방 토픽을 구독
    clientRef.current.subscribe(`/topic/chatroom/${room_id}`, (message)=>{
        //서버에서 받은 메세지 (body는 문자열이므로 JSON 파싱)
        const body = JSON.parse(message.body);

        //해당 room_id의 메세지 배열에 새 메세지를 추가
        setMessages((prev)=>({
            ...prev, //기존메세지 스프레드
            [room_id]: [...(prev[room_id] || []), body] //새 메세지 추가
        }));
    });

  };
    // Provider로 전역공급
    // value에 messages, sendMessage, subscribeRoom을 담아서
    // 하위 컴포넌트 어디서든 useSocket()으로 꺼내 쓸 수 있음
    return(
        <SocketContext.Provider value={{ messages, sendMessage, subscribeRoom}}>  
            {children}
        </SocketContext.Provider>
    )
}

//Consumer 훅: 어디서든 Context 꺼내 쓰기
//컴포넌트에서 쉽게 `const { messages, sendMessage } = useSocket();` 형태로 사용 가능

function useSocket() {
  return React.useContext(SocketContext);
}

export { SocketContext, SocketProvider, useSocket };
