import React, { useEffect, useState } from "react";
import { Accordion, ListGroup, Badge } from "react-bootstrap";
import { caxios } from "../../config/config";
import styles from "./ContactList.module.css";

const ContactList = () => {
  // 전체 멤버 데이터
  const [member, setMember] = useState([]);
  // JWT 토큰 준비 여부
  const [tokenReady, setTokenReady] = useState(false);
  // 검색창 표시 여부
  const [showSearch, setShowSearch] = useState(false);
  // 검색어
  const [searchTerm, setSearchTerm] = useState("");

  // 부서 리스트 (표시용)
  const departments = [
    { name: "연구개발", code: "RND" },
    { name: "사업관리팀", code: "BM" },
    { name: "AI센터", code: "AIC" },
    { name: "인사과", code: "HR" },
    { name: "재무/회계", code: "FNA" },
    { name: "마케팅팀", code: "MKT" },
  ];

  // 직급 코드 → 명칭 매핑
  const ranks = {
    J000: "사장",
    J001: "사원",
    J002: "주임",
    J003: "대리",
    J004: "과장",
    J005: "차장",
    J006: "부장",
    J007: "이사",
    J008: "부사장",
  };

  // 근무 상태 → 배지 색상
  const statusVariant = {
    working: "success",
    busy: "warning",
    away: "secondary",
    offline: "dark",
  };

  // 근무 상태 → 한글 텍스트
  const statusText = {
    working: "근무중",
    busy: "다른용무중",
    away: "자리비움",
    offline: "오프라인",
  };

  // 토큰 감시: 로그인 완료 전이라면 polling 으로 대기
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

  // 토큰 준비되면 멤버 목록 로드
  useEffect(() => {
    if (!tokenReady) return;
    caxios
      .get("/messenger/member")
      .then((resp) => setMember(resp.data))
      .catch((err) => console.error("데이터 요청 실패:", err));
  }, [tokenReady]);

  // 부서별 필터링 (검색 + 오프라인은 하단 정렬)
  const getDeptMembers = (deptCode) => {
    return member
      .filter(
        (m) =>
          m.dept_code?.trim().toUpperCase() === deptCode &&
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.work_status === "offline" && b.work_status !== "offline") return 1;
        if (a.work_status !== "offline" && b.work_status === "offline") return -1;
        return 0;
      });
  };

  /**
   * 더블클릭 시 채팅 팝업 오픈
   * 1) 로그인한 사용자 id(LoginID)와 상대 id(member.id)로 방 키를 만든다.
   * 2) 서버에 방 생성/조회 요청(같은 조합이면 같은 방을 재사용).
   * 3) room_id(UUID)를 응답받아 팝업 URL 쿼리에 넣어 연다.
   */
  const openChatPopup = async (member) => {
    const myId = sessionStorage.getItem("LoginID"); // 로그인한 사용자 식별자(id)
    if (!myId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    const targetId = member.id; // 상대방 식별자(id) - 백엔드 Member.id
    const targetName = member.name;
    const targetRank = ranks[member.rank_code] || "";

    // 두 사용자 id를 정렬하여 고유 키 생성 (동일 조합은 동일 방)
    const roomMembersKey = [myId, targetId].sort().join("_");

    try {
      // 방 생성/조회 요청 (이미 있으면 조회, 없으면 생성)
      const resp = await caxios.post(
        `/api/chat/room?key=${encodeURIComponent(roomMembersKey)}`
      );

      // 서버가 반환하는 채팅방 PK(UUID)
      const roomId = resp.data.roomId;

      // 팝업 파라미터: room_id, 상대 표시용 이름/직급
      const url = `${window.location.origin}/chatroom?room_id=${roomId}&target=${encodeURIComponent(
        targetName
      )}&rank=${encodeURIComponent(targetRank)}`;

      // 팝업 창 크기/위치 계산
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
      <div className={`${styles.searchBox} ${showSearch ? styles.searchBoxVisible : ""}`}>
        <input
          type="text"
          placeholder="이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 본문 - 스크롤 영역 */}
      <div className={styles.scrollArea}>
        <Accordion alwaysOpen>
          {departments.map((dept, idx) => {
            const deptMembers = getDeptMembers(dept.code);
            return (
              <Accordion.Item eventKey={String(idx)} key={dept.code}>
                <Accordion.Header>
                  {dept.name}
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
                              {ranks[m.rank_code] || "직급미상"}
                            </span>
                          </div>
                          <Badge
                            bg={statusVariant[m.work_status?.toLowerCase()] || "secondary"}
                          >
                            {statusText[m.work_status?.toLowerCase()] || "상태미상"}
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
