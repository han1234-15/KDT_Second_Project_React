import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "antd/dist/reset.css";
import { SocketProvider } from "./config/SocketContext"; // 우리가 만든 Provider import


// SocketProvider로 감싸사 전역에서 ws사용
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>
);

