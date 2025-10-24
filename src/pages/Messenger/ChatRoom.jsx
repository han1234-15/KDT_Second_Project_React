import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./ChatRoom.module.css";
import { useSocket } from "../../config/SocketContext";

export default function ChatRoom() {
  // URL 쿼리에서 채팅 상대 이름/직책을 읽어옴 (예: ?target=김철수&rank=과장)
  const [params] = useSearchParams();
  const targetName = params.get("target") || "대화상대";
  const targetRank = params.get("rank") || "";
  const room_id = params.get("room_id");
  const { messages, sendMessage, subscribeRoom } = useSocket();
  const userId = sessionStorage.getItem("LoginID");
  //  UI 상태들
  const [menuOpen, setMenuOpen] = useState(false);     // 햄버거 메뉴 열림/닫힘
  const [panelOpen, setPanelOpen] = useState(false);   // 오른쪽 사이드 패널 열림/닫힘
  const [panelMode, setPanelMode] = useState("");      // "files" | "members"
  const [chromeOffset, setChromeOffset] = useState(0); // 브라우저 프레임(타이틀바 등) 높이 보정값
  const [input, setInput] = useState("");
  
  
  
  useEffect(()=>{
    if(room_id) {subscribeRoom(room_id)}; // 스톰프 룸 아이디 구독
  },[room_id]);
  
  const list = messages[room_id] || [];
  const handleSend = ()=>{
    if(!input.trim()) return;
    sendMessage(room_id, {sender : userId, content: input});
    setInput("");
  }
  
  /**  컴포넌트 마운트 시 1회: 
   *  윈도우의 outerHeight(전체창) - innerHeight(콘텐츠 영역) = 프레임 오프셋 계산
   *  → resizeTo(height) 호출 시 내부 콘텐츠 높이가 줄어드는 문제를 방지하기 위함
   */
  useEffect(() => {
    const offset = window.outerHeight - window.innerHeight;
    setChromeOffset(offset);
  }, []);



  /** 사이드 패널 열기
   *  - 패널 모드 설정("files" 또는 "members")
   *  - 패널 열림으로 전환
   *  - 햄버거 메뉴 닫기
   *  - 팝업 창을 가로 2배(800)로 확장하되, 현재 좌표는 유지
   *  - 높이는 550px(콘텐츠 기준)로 유지하기 위해 프레임 보정값을 더함
   */
  const openSidePanel = (mode) => {
    setPanelMode(mode);
    setPanelOpen(true);
    setMenuOpen(false);

    // 현재 팝업의 좌표(화면 기준) 저장 → 리사이즈 후에도 그 자리에 유지
    const currentLeft = window.screenX;
    const currentTop = window.screenY;

    // 목표 크기: 가로 800, 콘텐츠 높이 550 + 프레임 보정
    const targetWidth = 800;
    const targetHeight = 550 + chromeOffset;

    //  그 자리에서 바로 리사이즈 + 좌표 재적용(점프 방지)
    window.resizeTo(targetWidth, targetHeight);
    window.moveTo(currentLeft, currentTop);
  };

  /** 사이드 패널 닫기
   *  - 패널 상태 초기화
   *  - 창 크기를 원래(가로 400)로 복귀
   *  - 현재 좌표 유지
   *  - 높이는 동일하게 550px(콘텐츠 기준) 유지
   */
  const closeSidePanel = () => {
    setPanelOpen(false);
    setPanelMode("");

    const currentLeft = window.screenX;
    const currentTop = window.screenY;

    const targetWidth = 400;
    const targetHeight = 550 + chromeOffset;

    window.resizeTo(targetWidth, targetHeight);
    window.moveTo(currentLeft, currentTop);
  };

  return (
    <div className={styles.popupContainer}>
      {/* ===== 상단바: 채팅 상대 표시 + 햄버거 메뉴 ===== */}
      <div className={styles.topbar}>
        {/* 좌측 타이틀: "OOO 직책 님과의 대화" */}
        <div className={styles.chatTitle}>
          <i className="bi bi-chat-dots-fill me-2"></i>
          {targetName}
          {targetRank ? ` ${targetRank}` : ""} 님과의 대화
        </div>

        {/* 우측: 햄버거 아이콘 + 드롭다운 메뉴 */}
        <div className={styles.menuContainer}>
          <i
            className="bi bi-list"
            onClick={() => setMenuOpen(!menuOpen)}
          ></i>

          {/* 메뉴 열렸을 때만 표시 */}
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              {/* 대화상대 초대하기: 사이드 패널을 "members" 모드로 열기 */}
              <button onClick={() => openSidePanel("members")}>
                <i className="bi bi-person-plus me-2"></i> 대화상대 초대하기
              </button>
              {/* 첨부파일: 사이드 패널을 "files" 모드로 열기 */}
              <button onClick={() => openSidePanel("files")}>
                <i className="bi bi-paperclip me-2"></i> 첨부파일
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== 채팅 메시지 영역 =====
          - 상대 메시지: 왼쪽(.you)
          - 내 메시지: 오른쪽(.me)
      */}
      <div className={styles.chatBox}>
        <div className={`${styles.msg} ${styles.you}`}>
          <div className={styles.msgBubble}>오늘 회의 자료 준비되었나요?</div>
        </div>

        <div className={`${styles.msg} ${styles.me}`}>
          <div className={styles.msgBubble}>
            네, 3시 회의 전에 업로드 예정이에요!
          </div>
        </div>
      </div>

      {/* ===== 하단 입력창 =====
          - 입력 인풋 + 전송 버튼
      */}
      <div className={styles.chatInput}>
        <input type="text" placeholder="메시지를 입력하세요..."
        value={input}
        onChange={(e)=> setInput(e.target.value)}
        onKeyDown={(e)=>e.key==="Enter" && handleSend()} />
        <button onClick={handleSend}>
          <i className="bi bi-send-fill me-1"></i> 전송
        </button>
      </div>

      {/* ===== 오른쪽 슬라이드 패널 =====
          - 패널이 열려 있을 때만 표시
          - 헤더 우측 X 아이콘으로 닫기
          - panelMode에 따라 내용 스위칭
      */}
      {panelOpen && (
        <div className={styles.sidePanel}>
          <div className={styles.panelHeader}>
            <span>
              {panelMode === "files" ? "📎 첨부파일 목록" : "👥 대화상대 초대"}
            </span>
            <i
              className="bi bi-x-lg"
              onClick={closeSidePanel}
              style={{ cursor: "pointer" }}
            ></i>
          </div>

          <div className={styles.panelBody}>
            {panelMode === "files" ? (
              // TODO: 실제 파일 목록 컴포넌트로 교체 예정
              <p>📁 첨부된 파일 목록을 여기에 표시합니다.</p>
            ) : (
              // TODO: 실제 멤버 검색/선택 컴포넌트로 교체 예정
              <p>👤 초대 가능한 멤버 목록을 여기에 표시합니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
