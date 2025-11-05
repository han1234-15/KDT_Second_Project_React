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
    .then((resp) => {
      console.log(" 서버 응답 데이터:", resp.data); //  여기에 콘솔 추가
      setMember(resp.data);
    })
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

  // 특정 사원을 더블클릭했을 때 채팅 팝업창을 여는 함수
const openChatPopup = async (member) => {

  // 현재 로그인한 사용자의 ID를 세션 스토리지에서 불러옴
  const myId = sessionStorage.getItem("LoginID");

  // 로그인 정보가 없을 경우 경고 메시지 출력 후 함수 종료
  if (!myId) {
    alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
    return;
  }

  // 채팅 대상(상대방)의 기본 정보 추출
  const targetId = member.id;                              // 상대방의 사용자 ID
  const targetName = member.name;                          // 상대방 이름
  const targetRank = ranks[member.rank_code] || "";         // 상대방 직급명 (rank_code 매핑, 없으면 빈 문자열)

  // 나와 상대방의 ID를 정렬하여 하나의 고유한 채팅방 키 생성
  // 예: user01과 user02 → "user01_user02" (정렬하여 순서 관계없이 동일한 키 사용)
  const roomMembersKey = [myId, targetId].sort().join("_");

  try {
    // 서버에 채팅방 생성 또는 기존 방 조회 요청
    // key 파라미터로 두 사용자 조합 키를 전달
    const resp = await caxios.post(
      `/api/chat/room?key=${encodeURIComponent(roomMembersKey)}`
    );

    // 서버 응답에서 채팅방 ID 추출
    const roomId = resp.data.roomId;

    // 팝업창에서 열릴 채팅방 URL 생성
    // 대상 이름과 직급을 쿼리 파라미터로 함께 전달 (한글 깨짐 방지를 위해 encodeURIComponent 사용)
    const url = `${window.location.origin}/chatroom?room_id=${roomId}&target=${encodeURIComponent(
      targetName
    )}&rank=${encodeURIComponent(targetRank)}`;

    // 팝업창 크기와 화면 위치 설정
    // width, height는 창 크기 지정
    // left, top은 화면 오른쪽 아래에 배치하기 위한 좌표 계산
    const width = 400;
    const height = 550;
    const left = window.screen.width - width - 300;  // 오른쪽 여백 40px
    const top = window.screen.height - height - 1400; // 아래쪽 여백 100px

    // 실제 팝업창을 여는 명령
    // 첫 번째 인자: URL
    // 두 번째 인자: 팝업 이름 (같은 이름의 창이 있으면 새로 안 열고 기존 창을 재활용)
    // 세 번째 인자: 창의 속성 지정 (크기, 위치, 스크롤, 상태바 등)
    window.open(
      url,
      `ChatWith_${targetId}`, // 팝업 이름 (상대방 ID 기반)
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
    );

  } catch (err) {
    // 서버 요청 또는 팝업 열기 중 오류가 발생한 경우
    console.error("채팅방 생성 또는 조회 실패:", err); // 콘솔에 에러 로그 출력
    alert("채팅방 생성에 실패했습니다.");               // 사용자에게 오류 알림
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
              <Accordion.Item eventKey={String(idx)} key={dept}> {/* 열림/닫힘을 식별하는 키(문자열 권장). Header와 Body를 서로 매칭*/} 
                <Accordion.Header>
                  {dept}
                  <Badge bg="info" className="ms-2">
                    {deptMembers.length}
                  </Badge>
                </Accordion.Header>

                <Accordion.Body>
                  {deptMembers.length > 0 ? (
                    <ListGroup variant="flush">
                      {deptMembers.map((m) => ( // 사원들 출력 행하나하나
                        <ListGroup.Item
                          key={m.seq || m.id}
                          className="d-flex justify-content-between align-items-center"
                          onDoubleClick={() => openChatPopup(m)} // 더블클릭 시 채팅 팝업을 여는 핸들러. 현재 사원 m을 인자로 전달
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
