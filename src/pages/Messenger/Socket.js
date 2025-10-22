import React from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const socket = new SockJS('http://10.10.55.97/ws-chat'); // 서버 WebSocket 엔드포인트
const stompClient = new Client({
  webSocketFactory: () => socket,
  debug: (str) => console.log(str),
});

stompClient.onConnect = () => {
  console.log('Connected!');
  // 서버 구독
  stompClient.subscribe('/topic/chat', (message) => {
    console.log('받은 메시지:', message.body);
  });

  // 서버로 메시지 전송
  stompClient.publish({
    destination: '/app/chat',
    body: JSON.stringify({ sender: '병주', content: '안녕하세요!' }),
  });
};

stompClient.activate();