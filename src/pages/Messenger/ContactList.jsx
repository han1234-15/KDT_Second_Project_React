import React, { useEffect, useState } from "react";
import { Accordion, ListGroup, Badge } from "react-bootstrap";
import { caxios } from "../../config/config";
import styles from "./ContactList.module.css";

const ContactList = () => {
  const [member, setMember] = useState([]);
  const [tokenReady, setTokenReady] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ 부서 목록 (DB에 한글 저장)
  const departments = [
    "연구개발",
    "사업관리",
    "AI센터",
    "인사과",
    "재무/회계",
    "마케팅팀",
  ];

  // ✅ 직급 코드 (유지)
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

  // ✅ 근무 상태 → 색상
  const statusVariant = {
    working: "success", // 근무중
    busy: "warning", // 다른용무중
    away: "secondary", // 자리비움
    offline: "dark", // 오프라인
  };

  // ✅ 근무 상태 → 한글 텍스트
  const statusText = {
    working: "근무중",
    busy: "다른용무중",
    away: "자리비움",
    offline: "오프라인",
  };

  // ✅ 토큰 감시
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

  // ✅ 멤버 목록 로드
  useEffect(() => {
    if (!tokenReady) return;
    caxios
      .get("/messenger/member")
      .then((resp) => setMember(resp.data))
      .catch((err) => console.error("데이터 요청 실패:", err));
  }, [tokenReady]);

  // ✅ 부서별 필터링 (DB값 한글 비교 + 오프라인 하단정렬 + 본인 제외)
  const getDeptMembers = (deptName) => {
    const myId = sessionStorage.getItem("LoginID");

    return member
      .filter(
        (m) =>
          m.dept_code?.trim() === deptName &&
          m.id !== myId && // ✅ 로그인한 본인 제외
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.work_status === "offline" && b.work_status !== "offline") return 1;
        if (a.work_status !== "offline" && b.work_status === "offline") return -1;
        return 0;
      });
  };

  // ✅ 더블클릭 시 채팅 팝업 오픈
  const openChatPopup = async (member) => {
    const myId = sessionStorage.getItem("LoginID");
    if (!myId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    const targetId = member.id;
    const targetName = member.name;
    const targetRank = ranks[member.rank_code] || "";

    // 방 키 (중복 방 방지용)
    const roomMembersKey = [myId, targetId].sort().join("_");

    try {
      const resp = await caxios.post(
        `/api/chat/room?key=${encodeURIComponent(roomMembersKey)}`
      );
      const roomId = resp.data.roomId;

      // 팝업 URL
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
      {/* 상단바 */}
      <div className={styles.header}>
        <span className={styles.title}>주소록</span>
        <span
          className={styles.searchToggle}
          onClick={() => setShowSearch(!showSearch)}
          role="button"
          aria-label="검색창 열기"
        >
          검색
        </span>
      </div>

      {/* 검색창 */}
      <div
        className={`${styles.searchBox} ${
          showSearch ? styles.searchBoxVisible : ""
        }`}
      >
        <input
          type="text"
          placeholder="이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 본문 */}
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
                          <div>
                            <strong>{m.name}</strong>
                            <span className="text-muted ms-1">
                              {ranks[m.rank_code] || ""}
                            </span>
                          </div>
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
                    <div className="text-muted small">등록된 인원이 없습니다.</div>
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
