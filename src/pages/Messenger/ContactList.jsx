import React, { useEffect, useState } from "react";
import { Accordion, ListGroup, Badge } from "react-bootstrap";
import { caxios } from "../../config/config";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./ContactList.module.css";

const ContactList = () => {
  const [member, setMember] = useState([]); // 전체 멤버 데이터
  const [tokenReady, setTokenReady] = useState(false); // JWT 토큰 준비 여부
  const [showSearch, setShowSearch] = useState(false); // 검색창 표시 여부
  const [searchTerm, setSearchTerm] = useState(""); // 검색어

  //  부서 리스트
  const departments = [
    { name: "연구개발", code: "RND" },
    { name: "사업관리팀", code: "BM" },
    { name: "AI센터", code: "AIC" },
    { name: "인사과", code: "HR" },
    { name: "재무/회계", code: "FNA" },
    { name: "마케팅팀", code: "MKT" },
  ];

  //  직급 매핑
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

  //  근무 상태 → 색상
  const statusVariant = {
    working: "success",
    busy: "warning",
    away: "secondary",
    offline: "dark",
  };

  //  근무 상태 → 한글 텍스트
  const statusText = {
    working: "근무중",
    busy: "다른용무중",
    away: "자리비움",
    offline: "오프라인",
  };

  //  토큰 확인
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) setTokenReady(true);
    else {
      const interval = setInterval(() => {
        const newToken = sessionStorage.getItem("token");
        if (newToken) {
          setTokenReady(true);
          clearInterval(interval);
        }
      }, 100);
    }
  }, []);

  //  토큰 준비되면 서버에서 멤버 정보 로드
  useEffect(() => {
    if (!tokenReady) return;
    caxios
      .get("/messenger/member")
      .then((resp) => setMember(resp.data))
      .catch((err) => console.error("데이터 요청 실패:", err));
  }, [tokenReady]);

  //  부서별 필터링 (검색 + 오프라인 정렬)
  const getDeptMembers = (deptCode) => {
    return member
      .filter(
        (m) =>
          m.dept_code?.trim().toUpperCase() === deptCode &&
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.work_status === "offline" && b.work_status !== "offline")
          return 1;
        if (a.work_status !== "offline" && b.work_status === "offline")
          return -1;
        return 0;
      });
  };

  //  더블클릭 시 채팅 팝업 열기
  const openChatPopup = (member) => {
    const width = 400;
    const height = 550;
    const left = window.screen.width - width - 40;
    const top = window.screen.height - height - 100;
    const token = sessionStorage.getItem("token");

    const url = `${window.location.origin}/chatroom?token=${token}&target=${encodeURIComponent(
      member.name
    )}&rank=${encodeURIComponent(ranks[member.rank_code] || "")}`;

    window.open(
      url,
      `ChatWith_${member.name}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
    );

    console.log(
      `💬 ${member.name} ${ranks[member.rank_code] || ""} 님과의 채팅방 팝업 열림`
    );
  };

  return (
    <div className={styles.contactContainer}>
      {/*  상단바 */}
      <div className={styles.header}>
        <span className={styles.title}>주소록</span>
        <i
          className="bi bi-search"
          onClick={() => setShowSearch(!showSearch)}
        ></i>
      </div>

      {/*  검색창 */}
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

      {/*  본문 - 스크롤 영역 */}
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
