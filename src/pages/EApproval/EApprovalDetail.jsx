import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/ApprovalDetail.css";
import { caxios } from "../../config/config";

function EApprovalDetail() {
  const { seq } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loginUser, setLoginUser] = useState(null);

  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [decisionTarget, setDecisionTarget] = useState(null); // ✅ 추가
  
  // 로그인 사용자 정보
  useEffect(() => {
    caxios.get("/member/me").then(res => setLoginUser(res.data));
  }, []);

  // 문서 상세 조회
  useEffect(() => {
    caxios.get(`/Eapproval/detail/${seq}`)
      .then((res) => setDoc(res.data))
      .catch((err) => console.error("❌ detail error:", err));
  }, [seq]);

  if (!doc || !loginUser) return <div>📄 불러오는 중...</div>;

  const approvers = doc.approvers ?? [];

  //  현재 결재자 찾기
  const currentApprover = approvers
  .filter(a => a.orderNo !== null && (a.status === "N" || a.status == null))
  .sort((a, b) => a.orderNo - b.orderNo)[0];

const isMyTurn = currentApprover?.id === loginUser.id;

  //  승인
  const handleApprove = () => {
    caxios.post("/Eapproval/approve", { seq: doc.seq, userId: loginUser.id })
      .then(() => {
        alert("✅ 승인 완료");
        window.location.reload();
      });
  };

  // ✅ 반려
  const handleReject = () => {
    if (!rejectReason.trim()) return alert("반려 사유를 입력해주세요.");
    caxios.post("/Eapproval/reject", { seq: doc.seq, userId: loginUser.id, reason: rejectReason })
      .then(() => {
        alert("❌ 반려 완료");
        window.location.reload();
      });
  };

  return (
    <div className="approval-detail-container">
      <h2>문서 상세보기</h2>

      <h3>결재선</h3>
      <table className="line-table">
        <tbody>
          <tr>
            {approvers.map((a, idx) => (
              <td key={idx}>{a.name} ({a.rank_code})</td>
            ))}
          </tr>
          <tr>
            {approvers.map((a, idx) => (
              <td key={idx}>
                {(doc.status !== "REJECTED" && doc.status !== "APPROVED" && isMyTurn && a.id === loginUser.id) ? (
  <button
    className="approve-btn"
    onClick={() => { setDecisionTarget(a); setShowDecisionModal(true); }}
  >
    ➕
  </button>
) : (
                  (a.status || a.STATUS) === "Y" ? "✔ 승인" :
                  (a.status || a.STATUS) === "R" ? "✖ 반려" :
                  "⏳ 대기"
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <h3>참조</h3>
      {doc.referenceList?.length > 0 ? (
        <table className="line-table">
          <tbody>
            <tr>
              {doc.referenceList.map((r, idx) => (
                <td key={idx}>{r.name} ({r.rank_code})</td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : <div>없음</div>}

      <table className="detail-table">
        <tbody>
          <tr><th>문서번호</th><td>{doc.seq}</td></tr>
          <tr><th>제목</th><td>{doc.title}</td></tr>
          <tr><th>작성자</th><td>{doc.writer}</td></tr>
          <tr><th>작성일</th><td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td></tr>
          <tr><th>내용</th><td className="content">{doc.comments}</td></tr>
        </tbody>
      </table>

      {doc.status=="REJECTED" ?(
         <div className="rejected-info">
     ❌ 이 문서는 이미 <strong>반려</strong>되었습니다.
     {doc.rejectReason && (
       <div className="reject-reason-box">
         <strong>반려 사유:</strong> {doc.rejectReason}
       </div>
     )}
   </div>
      ):(
    

      <div className="button-area">
        <button onClick={() => navigate(-1)}>← 목록으로</button>
      </div>
      )}

      {/* ✅ 모달 */}
      {showDecisionModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3><strong>{decisionTarget?.name}</strong> 님, 결재하시겠습니까?</h3>

            <div className="action-buttons">
              <button className="approve-btn" onClick={handleApprove}>✅ 승인</button>
              <button className="reject-btn" onClick={handleReject}>❌ 반려</button>
            </div>

            <textarea
              placeholder="반려 사유 입력 (반려 시 필수)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>

            <button className="close-btn" onClick={() => setShowDecisionModal(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EApprovalDetail;
