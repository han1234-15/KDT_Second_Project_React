// src/components/chat/ContactList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Accordion, ListGroup, Badge } from "react-bootstrap";
import { caxios } from "../../config/config";
import styles from "./ContactList.module.css";

const ContactList = () => {
  // 상태 정의
  const [member, setMember] = useState([]);
  const [tokenReady, setTokenReady] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 부서 목록
  const departments = [
    "연구개발",
    "사업관리",
    "AI센터",
    "인사과",
    "재무/회계",
    "마케팅팀",
  ];

  // 직급 코드 → 직급명 매핑
  const ranks = {
    J001: "사원",
    J002: "주임",
    J003: "대리",
    J004: "과장",
    J005: "차장",
    J006: "부장",
    J007: "이사",
    J008: "부사장",
    J009: "사장",
  };

  // 근무 상태별 표시
  const statusVariant = {
    working: "success",
    busy: "warning",
    away: "secondary",
    offline: "dark",
  };
  const statusText = {
    working: "근무중",
    busy: "다른용무중",
    away: "자리비움",
    offline: "오프라인",
  };

  // 로그인 토큰 대기
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setTokenReady(true);
      return;
    }

    const interval = setInterval(() => {
      const newToken = sessionStorage.getItem("token");
      if (newToken) {
        setTokenReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 토큰 준비되면 멤버 목록 불러오기
  useEffect(() => {
    if (!tokenReady) return;

    caxios
      .get("/messenger/member")
      .then((resp) => setMember(resp.data))
      .catch((err) => console.error("데이터 요청 실패:", err));
  }, [tokenReady]);

  /**
   * 부서별 멤버 필터링
   * - 본인 제외
   * - 검색어 포함된 이름만 남김
   * - 오프라인은 하단 정렬
   */
  const getDeptMembers = useCallback(
    (deptName) => {
      const myId = sessionStorage.getItem("LoginID");
      return member
        .filter(
          (m) =>
            m.dept_code?.trim() === deptName &&
            m.id !== myId &&
            (searchTerm.trim() === "" ||
              m.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
          if (a.work_status === "offline" && b.work_status !== "offline") return 1;
          if (a.work_status !== "offline" && b.work_status === "offline") return -1;
          return 0;
        });
    },
    [member, searchTerm]
  );

  // 더블클릭 시 채팅방 오픈
  const openChatPopup = async (member) => {
    const myId = sessionStorage.getItem("LoginID");
    if (!myId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    const targetId = member.id;
    const targetName = member.name;
    const targetRank = ranks[member.rank_code] || "";

    const roomMembersKey = [myId, targetId].sort().join("_");

    try {
      const resp = await caxios.post(
        `/api/chat/room?key=${encodeURIComponent(roomMembersKey)}`
      );
      const roomId = resp.data.roomId;

      const url = `${window.location.origin}/chatroom?room_id=${roomId}&target=${encodeURIComponent(
        targetName
      )}&rank=${encodeURIComponent(targetRank)}`;

      const width = 400;
      const height = 550;
      const left = window.screen.width - width - 40;
      const top = window.screen.height - height - 100;

      window.open(
        url,
        `ChatWith_${targetId}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
      );
    } catch (err) {
      console.error("채팅방 생성 또는 조회 실패:", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <div className={styles.contactContainer}>
      {/* 상단 헤더 */}
      <div className={styles.header}>
        <span className={styles.title}>주소록</span>
        {/* 검색창 토글 버튼 */}
        <span
          className={styles.searchToggle}
          onClick={() => setShowSearch(!showSearch)}
          role="button"
          aria-label="검색창 열기"
        >
          검색
        </span>
      </div>

      {/* 검색 입력창 */}
      <div
        className={`${styles.searchBox} ${
          showSearch ? styles.searchBoxVisible : ""
        }`}
      >
        <input
          type="text"
          placeholder="이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // 실시간 반영
        />
      </div>

      {/* 부서별 사원 목록 */}
      <div className={styles.scrollArea}>
        <Accordion alwaysOpen>
          {departments.map((dept, idx) => {
            const deptMembers = getDeptMembers(dept);
            return (
              <Accordion.Item eventKey={String(idx)} key={dept}>
                <Accordion.Header>
                  {dept}
                  <Badge bg="info" className="ms-2">
                    {deptMembers.length}
                  </Badge>
                </Accordion.Header>

                <Accordion.Body>
                  {deptMembers.length > 0 ? (
                    <ListGroup variant="flush">
                      {deptMembers.map((m) => (
                        <ListGroup.Item
                          key={m.seq || m.id}
                          className="d-flex justify-content-between align-items-center"
                          onDoubleClick={() => openChatPopup(m)}
                          style={{ cursor: "pointer" }}
                        >
                          {/* 이름 + 직급 */}
                          <div>
                            <strong>{m.name}</strong>
                            <span className="text-muted ms-1">
                              {ranks[m.rank_code] || ""}
                            </span>
                          </div>

                          {/* 근무 상태 뱃지 */}
                          <Badge
                            bg={
                              statusVariant[m.work_status?.toLowerCase()] ||
                              "secondary"
                            }
                          >
                            {statusText[m.work_status?.toLowerCase()] ||
                              "상태미상"}
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-muted small">
                      등록된 인원이 없습니다.
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default ContactList;
