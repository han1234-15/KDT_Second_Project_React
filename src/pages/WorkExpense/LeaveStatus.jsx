import { useEffect, useState } from "react";
import { caxios } from "../../config/config";

// 직급 순서
const rankOrder = ["사원", "대리", "과장", "차장", "부장", "이사", "부사장", "사장"];

function LeaveStatus() {
  const [list, setList] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const leaveCodeMap = {
    half_pm: "반차(오후)",
    half_am: "반차(오전)",
    annual: "연차",
    sick: "병가",
  };

  const statusMap = {
    WAIT: "결재대기",
    APPROVED: "승인",
    REJECTED: "반려",
    N: "대기중",
    A: "승인",
  };

  const isAdmin =
    loginUser &&
    rankOrder.indexOf(loginUser.rank_code) >= rankOrder.indexOf("과장");

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const validString = isoString.replace(" ", "T");
    const date = new Date(validString);
    if (isNaN(date)) return "-";
    return date.toISOString().split("T")[0];
  };

  const formatLeaveRange = (row) => {
    const date = formatDate(row.startLeaveTime);
    if (row.leaveCode === "half_am") return `${date} 09:00 ~ 12:00`;
    if (row.leaveCode === "half_pm") return `${date} 13:00 ~ 18:00`;
    return `${formatDate(row.startLeaveTime)} ~ ${formatDate(row.endLeaveTime)}`;
  };

  const fetchData = () => {
    caxios.get("/leave/status").then((res) => setList(res.data));
  };

  useEffect(() => {
    fetchData();
    caxios.get("/member/me").then((res) => setLoginUser(res.data));
  }, []);

  const approveHandler = () => {
    caxios.post(`/leave/approve`, { seq: selectedRow.seq }).then(() => {
      alert("승인 처리되었습니다.");
      closeModal();
      fetchData();
    });
  };

  const rejectHandler = () => {
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력하세요.");
      return;
    }

    caxios
      .post(`/leave/reject`, { seq: selectedRow.seq, reason: rejectReason })
      .then(() => {
        alert("반려 처리되었습니다.");
        closeModal();
        fetchData();
      });
  };

  const openModal = async (row) => {
    console.log("🟢 클릭된 행 데이터:", row);
    setSelectedRow(row);
    setIsModalOpen(true);

    if (row.approvalId) {
      try {
        const res = await caxios.get(`/Eapproval/line/${row.approvalId}`);
        console.log("🟡 결재선 API 응답:", res.data);

        let lineData = res.data;
        if (lineData.approvers) lineData = lineData.approvers;

        setSelectedRow((prev) => ({
          ...prev,
          approvalLine: lineData,
        }));

      } catch (err) {
        console.error("❌ 결재선 불러오기 실패:", err);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setRejectReason("");
    setShowRejectInput(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>휴가 현황</h2>
      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>신청자</th>
            <th>휴가종류</th>
            <th>기간</th>
            <th>사유</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {list.map((row, index) => (
            <tr key={`${row.seq}-${index}`}>
              <td>{row.memberId}</td>
              <td>
                {leaveCodeMap[row.leaveCode?.toLowerCase()] || row.leaveCode || "-"}
              </td>
              <td>{formatLeaveRange(row)}</td>
              <td>{row.reason}</td>
              <td>{statusMap[row.status]}</td>
              <td>
                <button onClick={() => openModal(row)}>보기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedRow && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3>휴가 상세</h3>

            <p><strong>신청자:</strong> {selectedRow.memberId}</p>
            <p><strong>휴가종류:</strong> {leaveCodeMap[selectedRow.leaveCode]}</p>
            <p><strong>기간:</strong> {formatLeaveRange(selectedRow)}</p>
            <p><strong>사유:</strong> {selectedRow.reason}</p>
            <p><strong>상태:</strong> {statusMap[selectedRow.status]}</p>

            {isAdmin && selectedRow?.approvalLine?.length > 0 && (
              <div style={{ margin: "10px 0" }}>
                <strong>결재선:</strong>
               <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", textAlign: "center" }}>
  <thead>
    <tr>
      <th style={thStyle}>구분</th>
      {selectedRow.approvalLine.map((a, idx) => (
        <th key={idx} style={thStyle}>
          {a.NAME} ({a.RANK_CODE})
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={tdStyle}>결재</td>
      {selectedRow.approvalLine.map((a, idx) => (
        <td key={idx} style={tdStyle}>
          {statusMap[a.STATUS] || "대기중"}
        </td>
      ))}
    </tr>
  </tbody>
</table>
              </div>
            )}

            {isAdmin &&
              selectedRow.status === "N" &&
              selectedRow.member_id !== loginUser.id && (
                <>
                  <button onClick={approveHandler}>승인</button>
                  <button onClick={() => setShowRejectInput(true)}>반려</button>

                  {showRejectInput && (
                    <div style={{ marginTop: "10px" }}>
                      <textarea
                        placeholder="반려 사유 입력"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{ width: "100%", height: "60px" }}
                      ></textarea>
                      <button onClick={rejectHandler} style={{ marginTop: "5px" }}>
                        반려 확정
                      </button>
                    </div>
                  )}
                </>
              )}

            <button onClick={closeModal} style={{ marginTop: "10px" }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "420px",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "6px",
  background: "#f7f7f7",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "6px",
};

export default LeaveStatus;
