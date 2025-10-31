import React, { useEffect, useState } from "react";
import { Accordion, ListGroup, Button } from "react-bootstrap";
import { caxios } from "../../config/config";
import styles from "./ContactListInvite.module.css";

export default function ContactListInvite({ roomId, onClose }) {

  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const userId = sessionStorage.getItem("LoginID");

  const departments = [
    { name: "연구개발", code: "RND" },
    { name: "사업관리팀", code: "BM" },
    { name: "AI센터", code: "AIC" },
    { name: "인사과", code: "HR" },
    { name: "재무/회계", code: "FNA" },
    { name: "마케팅팀", code: "MKT" },
  ];

  const ranks = {
    J001: "사원", J002: "주임", J003: "대리", J004: "과장",
    J005: "차장", J006: "부장", J007: "이사", J008: "부사장",
  };

  useEffect(() => {
    caxios.get("/messenger/member")
      .then(resp => setMembers(resp.data.filter(m => m.id !== userId)))
      .catch(console.error);
  }, [userId]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  /**  서버 요구 RequestParam 형식에 맞춰 전송 */
  const inviteSelected = async () => {
    if (!roomId) return alert("roomId 없음! 창을 닫고 다시 진입해주세요!");
    if (selected.size < 1) return alert("초대할 대상을 선택해주세요!");

    const memberQuery = Array.from(selected)
      .map(id => `memberIds=${id}`)
      .join("&");

    console.log("📨 Invite Query:", `roomId=${roomId}&${memberQuery}`);

    try {
      setLoading(true);

      await caxios.post(`/api/chat/invite?roomId=${roomId}&${memberQuery}`);

      
      onClose();

    } catch (err) {
      console.error(" 초대 실패:", err.response?.data || err.message);
      alert(err.response?.data?.message || "서버 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const getDeptMembers = (code) =>
    members.filter(m => m.dept_code?.trim().toUpperCase() === code);

  return (
    <div className={styles.container}>
      <Accordion alwaysOpen>
        {departments.map((dept, idx) => (
          <Accordion.Item eventKey={String(idx)} key={dept.code}>
            <Accordion.Header>{dept.name}</Accordion.Header>
            <Accordion.Body>
              <ListGroup>
                {getDeptMembers(dept.code).map((m) => (
                  <ListGroup.Item
                    key={m.id}
                    action
                    active={selected.has(m.id)}
                    onClick={() => toggleSelect(m.id)}
                    className={styles.memberItem}
                  >
                    {m.name} ({ranks[m.rank_code] || ""})
                    {selected.has(m.id) && <span className={styles.check}>✔</span>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <Button
        variant="primary"
        disabled={loading}
        className={styles.inviteButton}
        onClick={inviteSelected}
      >
        {loading ? "초대 중..." : `초대하기 (${selected.size})`}
      </Button>
    </div>
  );
}
