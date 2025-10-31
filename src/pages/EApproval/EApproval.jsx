import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { caxios } from "../../config/config";
import "./styles/ApprovalPage.css";

function EApproval() {
  const navigate = useNavigate();
  const { status = "show" } = useParams();
  const [docs, setDocs] = useState([]);

const userId = sessionStorage.getItem("LoginID");
console.log("🔥 최종 userId:", userId);
 const upperStatus = status.toUpperCase();
  const statusMap = {
    WAIT: "승인 대기",
    CHECKING: "진행 중",
    PROCESSING: "예정",
    APPROVED: "기안",
    REJECTED: "반려",
    TEMP: "임시 저장",
  };

useEffect(() => {
  let url = "";
 

  switch (upperStatus) {
    case "WAIT": // 승인 대기
      url = `/Eapproval/my/wait?userId=${userId}`;
      break;

    case "PROCESSING": // 예정 (앞으로 결재할 문서)
      url = `/Eapproval/my/scheduled?userId=${userId}`;
      break;

    case "CHECKING": // 진행 중 (결재가 일부 완료됨)
      url = `/Eapproval/CHECKING`;
      break;

    case "APPROVED":
    case "REJECTED":
    case "TEMP":
      url = `/Eapproval/${upperStatus}`;
      break;

    default:
      url = `/Eapproval/A`;
  }

  caxios.get(url).then((res) => setDocs(res.data));
}, [status, userId]);

  return (
    <div className="approval-container">
      <table className="approval-table">
        <thead>
          <tr>
            <th>문서번호</th>
            <th>제목</th>
            <th>기안자</th>
            <th>기안일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {docs.length > 0 ? (
            docs.map((doc) => (
              <tr key={doc.seq}>
                <td>{doc.seq}</td>
                <td
                  className="title-cell"
                  style={{ cursor: "pointer", color: "#0077cc", textDecoration: "underline" }}
                  onClick={() => {
                    if (doc.status === "TEMP") navigate(`/Eapproval/edit/${doc.seq}`);
                    else navigate(`/Eapproval/detail/${doc.seq}`);
                  }}
                >
                  {doc.title}
                </td>
                <td>{doc.writer}</td>
                <td>{new Date(doc.writeDate).toLocaleString("ko-KR")}</td>
                <td>{statusMap[ upperStatus === "PROCESSING" ? "PROCESSING" : doc.status]}
                  </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-msg">표시할 문서가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EApproval;
