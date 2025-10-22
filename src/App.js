import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styles from "./App.module.css";


import Home from "./pages/Home/Home";
import MailRoute from "./pages/Mail/MailRoute";
import BoardRoute from "./pages/Board/BoardRoute";
import ScheduleRoute from "./pages/Schedule/ScheduleRoute";
import SharedMailRoute from "./pages/SharedMail/SharedMailRoute";
import ContactsRoute from "./pages/Contacts/ContactsRoute";
import MessengerRoute from "./pages/Messenger/MessengerRoute";
import WorkExpenseRoute from "./pages/WorkExpense/WorkExpenseRoute";
import EApprovalRoute from "./pages/EApproval/EApprovalRoute";
import NoteRoute from "./pages/Note/NoteRoute";
import TaskRoute from "./pages/Task/TaskRoute";
import ManagementRoute from "./pages/Management/ManagementRoute";

import Login from "./pages/Login/Login";
import Messenger from "./pages/Messenger/Messenger";
import ChatRoomRoute from "./pages/Messenger/ChatRoomRoute"; // ✅ 독립 라우트

import Header from "./pages/Common/Header";
import Sidebar from "./pages/Common/Sidebar";


import useAuthStore from "./store/authStore";

import ContentTap from "./pages/Common/ContentTap";
import ContentMain from "./pages/Common/ContentMain";

function App() {

  const isLogin = useAuthStore(state => state.isLogin)
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(true); //로딩 확인용 상태변수


  useEffect(() => {
    // 세션에서 로그인 상태 확인
    const token = sessionStorage.getItem("token");

    if (token) {
      login(token); // token 자체를 store에 넣는게 일반적
    }
    setLoading(false); // 토큰 확인 후 렌더링 하도록 함.
  }, []);



  //토큰을 확인하는데 시간이 걸려서 loading으로 토큰 확인이 끝나기 전까지 다른 컴포넌트가 렌더링 되지 않도록 함.
  if (loading) {
    return null; // 혹은 스켈레톤 화면, 로딩 스피너
  }

  // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!isLogin) {
    return <Login />;
  }

  // 로그인이 되어 있으면 url 링크에 맞춰서 동작.
  return (
    <BrowserRouter>
      <Routes>
        {/*  메신저 팝업 (Infinity UI) */}
        <Route path="/messenger-popup/*" element={<Messenger />} />

        {/*  독립 채팅방 팝업 (완전히 분리) */}
        <Route path="/chatroom/*" element={<ChatRoomRoute />} />

        {/* ✅ 공통 그룹웨어 레이아웃 */}
        <Route
         path="/*" element={<ContentMain />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
