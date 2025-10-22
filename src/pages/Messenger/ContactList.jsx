import React, { useEffect, useState } from "react";
import { Accordion, ListGroup, Badge } from "react-bootstrap";
import { caxios } from "../../config/config";
import "bootstrap-icons/font/bootstrap-icons.css"; // ✅ Bootstrap Icons 로드
import styles from "./ContactList.module.css";

const ContactList = () => {
  const [member, setMember] = useState([]);        // 전체 멤버 데이터
  const [tokenReady, setTokenReady] = useState(false); // JWT 토큰 준비 여부

  // ✅ 부서 리스트 (job_code 기준)
  const departments = [
    { name: "연구개발", code: "RND" },
    { name: "사업관리팀", code: "BM" },
    { name: "AI센터", code: "AIC" },
    { name: "인사과", code: "HR" },
    { name: "재무/회계", code: "FNA" },
    { name: "마케팅팀", code: "MKT" },
  ];

  // ✅ 직급 매핑
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

// ✅ 근무 상태 → 색상
const statusVariant = {
  working: "success",     // 근무중
  busy: "warning",        // 다른용무중
  away: "secondary",      // 자리비움
  offline: "dark",        // 오프라인
};

// ✅ 근무 상태 → 한글 텍스트
const statusText = {
  working: "근무중",
  busy: "다른용무중",
  away: "자리비움",
  offline: "오프라인",
};


  // ✅ 토큰 확인 (메신저 팝업에서 JWT 세션 체크)
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) setTokenReady(true);
    else {
      // 토큰이 아직 없으면 0.1초마다 확인
      const interval = setInterval(() => {
        const newToken = sessionStorage.getItem("token");
        if (newToken) {
          setTokenReady(true);
          clearInterval(interval);
        }
      }, 100);
    }
  }, []);

  // ✅ 토큰 준비되면 서버에서 멤버 정보 로드
  useEffect(() => {
    if (!tokenReady) return;
    caxios
      .get("/messenger/member")
      .then((resp) => setMember(resp.data))
      .catch((err) => console.error("데이터 요청 실패:", err));
  }, [tokenReady]);

  // ✅ 부서별 필터링 함수
  const getDeptMembers = (deptCode) =>
    member.filter((m) => m.job_code?.trim().toUpperCase() === deptCode);

  // ✅ 더블클릭 시 채팅 팝업 열기 함수
const openChatPopup = (member) => {
  const width = 400;
  const height = 550;
  const left = window.screen.width - width - 40;
  const top = window.screen.height - height - 100;
  const token = sessionStorage.getItem("token");

  // ✅ 독립 라우트로 변경
  const url = `${window.location.origin}/chatroom?token=${token}&target=${encodeURIComponent(
    member.member_name
  )}&rank=${encodeURIComponent(ranks[member.rank_code] || "")}`;

  window.open(
    url,
    `ChatWith_${member.member_name}`,
    `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
  );

  console.log(
    `💬 ${member.member_name} ${ranks[member.rank_code] || ""} 님과의 채팅방 팝업 열림`
  );
};

  return (
    <div className={styles.contactContainer}>
      {/* ✅ 상단바 */}
      <div className={styles.header}>
        <span className={styles.title}>주소록</span>
        <i className="bi bi-search"></i> {/* Bootstrap 돋보기 아이콘 */}
      </div>

      {/* ✅ 본문 - 아코디언 구조 */}
      <Accordion alwaysOpen>
        {departments.map((dept, idx) => {
          const deptMembers = getDeptMembers(dept.code);
          return (
            <Accordion.Item eventKey={String(idx)} key={dept.code}>
              {/* 부서명 + 인원수 */}
              <Accordion.Header>
                {dept.name}
                <Badge bg="info" className="ms-2">
                  {deptMembers.length}
                </Badge>
              </Accordion.Header>

              {/* 인원 리스트 */}
              <Accordion.Body>
                {deptMembers.length > 0 ? (
                  <ListGroup variant="flush">
                    {deptMembers.map((m) => (
                      <ListGroup.Item
                        key={m.seq || m.id}
                        className="d-flex justify-content-between align-items-center"
                        onDoubleClick={() => openChatPopup(m)} // ✅ 더블클릭 이벤트
                        style={{ cursor: "pointer" }}
                      >
                        {/* 왼쪽: 이름 + 직급 */}
                        <div>
                          <strong>{m.member_name}</strong>{" "}
                          <span className="text-muted">
                            {ranks[m.rank_code] || "직급미상"}
                          </span>
                        </div>

                        {/* 오른쪽: 근무 상태 뱃지 */}
                        <Badge
                          bg={
                            statusVariant[m.status?.toLowerCase()] ||
                            "secondary"
                          }
                        >
                          {statusText[m.status?.toLowerCase()] || "상태미상"}
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
  );
};

export default ContactList;
