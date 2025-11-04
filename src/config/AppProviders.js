import React from "react";
import { SocketProvider } from "./SocketContext";
import NotificationSocket from "./NotificationSocket";
import GlobalMessengerNotification from "../pages/Common/GlobalMessengerNotification";

/**
 * 전역 Provider 컴포넌트
 * - SocketProvider, NotificationSocket, GlobalMessengerNotification을 묶어서
 *   메인 그룹웨어 페이지에서만 실행되도록 관리.
 */
// src/config/AppProviders.jsx
export const AppProviders = ({ children }) => (
  <>
    {/* 실시간 알림 WebSocket */}
    <NotificationSocket />

    {/* 전역 메신저 알림 */}
    <GlobalMessengerNotification />

    {/* 자식 라우트 */}
    {children}
  </>
);

